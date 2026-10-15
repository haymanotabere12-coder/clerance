const { z } = require("zod");
const Approval = require("../models/Approval");
const Attachment = require("../models/Attachment");
const asyncHandler = require("../utils/asyncHandler");
const { advance } = require("../services/workflowService");

const loadOwnPending = async (req, res) => {
  const approval = await Approval.findById(req.params.id);
  if (!approval) {
    res.status(404).json({ message: "Approval not found" });
    return null;
  }
  if (String(approval.office) !== String(req.user.office)) {
    res.status(403).json({ message: "This request belongs to another office" });
    return null;
  }
  if (approval.status !== "Pending") {
    res.status(400).json({ message: "This request is not pending" });
    return null;
  }
  return approval;
};

exports.queue = asyncHandler(async (req, res) => {
  const approvals = await Approval.find({ office: req.user.office, status: "Pending" })
    .populate({
      path: "request",
      select: "reason submittedAt student",
      populate: { path: "student", select: "fullName universityId department" },
    })
    .sort("createdAt");
  const ids = approvals.map((a) => a.request?._id).filter(Boolean);
  const files = await Attachment.find({ request: { $in: ids } }).select("request originalName size");
  res.json(
    approvals.map((a) => ({
      ...a.toObject(),
      attachments: files.filter((x) => String(x.request) === String(a.request?._id)),
    }))
  );
});

exports.approve = asyncHandler(async (req, res) => {
  const approval = await loadOwnPending(req, res);
  if (!approval) return;

  approval.status = "Approved";
  approval.approver = req.user._id;
  approval.actedAt = new Date();
  await approval.save();

  const request = await advance(approval.request);
  res.json({ message: "Approved", requestStatus: request.status });
});

exports.reject = asyncHandler(async (req, res) => {
  const parsed = z.object({ reason: z.string().min(3) }).safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "A rejection reason is required" });
  }

  const approval = await loadOwnPending(req, res);
  if (!approval) return;

  approval.status = "Rejected";
  approval.reason = parsed.data.reason;
  approval.approver = req.user._id;
  approval.actedAt = new Date();
  await approval.save();

  const request = await advance(approval.request);
  res.json({ message: "Rejected", requestStatus: request.status });
});

