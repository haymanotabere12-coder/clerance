const { z } = require("zod");
const Office = require("../models/Office");
const Approval = require("../models/Approval");
const ClearanceRequest = require("../models/ClearanceRequest");
const asyncHandler = require("../utils/asyncHandler");
const { advance } = require("../services/workflowService");

const createSchema = z.object({
  reason: z.enum(["graduation", "withdrawal", "transfer"]),
});

exports.createRequest = asyncHandler(async (req, res) => {
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Reason must be graduation, withdrawal or transfer" });
  }

  const active = await ClearanceRequest.findOne({
    student: req.user._id,
    status: { $in: ["In Progress", "Blocked"] },
  });
  if (active) return res.status(409).json({ message: "You already have an active request" });

  const offices = await Office.find({ active: true });
  if (!offices.length) return res.status(500).json({ message: "No offices configured" });

  const firstStage = Math.min(...offices.map((o) => o.stage));
  const request = await ClearanceRequest.create({
    student: req.user._id,
    reason: parsed.data.reason,
    currentStage: firstStage,
  });

  await Approval.insertMany(
    offices.map((o) => ({
      request: request._id,
      office: o._id,
      stage: o.stage,
      status: o.stage === firstStage ? "Pending" : "Waiting",
    }))
  );

  res.status(201).json(request);
});

exports.myRequests = asyncHandler(async (req, res) => {
  const requests = await ClearanceRequest.find({ student: req.user._id }).sort("-createdAt");
  res.json(requests);
});

exports.getRequest = asyncHandler(async (req, res) => {
  const request = await ClearanceRequest.findById(req.params.id).populate("student", "fullName universityId department");
  if (!request) return res.status(404).json({ message: "Request not found" });

  const isOwner = String(request.student._id) === String(req.user._id);
  if (!isOwner && req.user.role !== "admin") {
    return res.status(403).json({ message: "You do not have permission" });
  }

  const approvals = await Approval.find({ request: request._id })
    .populate("office", "name stage")
    .sort("stage");
  res.json({ request, approvals });
});

exports.resubmit = asyncHandler(async (req, res) => {
  const request = await ClearanceRequest.findOne({ _id: req.params.id, student: req.user._id });
  if (!request) return res.status(404).json({ message: "Request not found" });
  if (request.status !== "Blocked") {
    return res.status(400).json({ message: "Only blocked requests can be resubmitted" });
  }

  await Approval.updateMany(
    { request: request._id, status: "Rejected" },
    { $set: { status: "Pending" }, $unset: { reason: 1, actedAt: 1, approver: 1 } }
  );
  const updated = await advance(request._id);
  res.json(updated);
});
