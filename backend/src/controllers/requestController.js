const mongoose = require("mongoose");
const { z } = require("zod");
const ClearanceType = require("../models/ClearanceType");
const Approval = require("../models/Approval");
const Attachment = require("../models/Attachment");
const { detectType } = require("../utils/fileCheck");
const ClearanceRequest = require("../models/ClearanceRequest");
const asyncHandler = require("../utils/asyncHandler");
const { advance } = require("../services/workflowService");

const createSchema = z.object({
  clearanceTypeId: z.string().refine((v) => mongoose.isValidObjectId(v), "Choose a clearance type"),
  reason: z.string().trim().max(500).optional(),
});

exports.createRequest = asyncHandler(async (req, res) => {
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: parsed.error.issues[0].message });
  }

  const type = await ClearanceType.findById(parsed.data.clearanceTypeId).populate("offices");
  if (!type || !type.active) {
    return res.status(400).json({ message: "This clearance type is not available" });
  }

  const reason = parsed.data.reason || "";
  if (type.requiresReason && reason.length < 5) {
    return res.status(400).json({ message: "Please write your reason (at least 5 characters)" });
  }

  if (req.file && !detectType(req.file.buffer)) {
    return res.status(400).json({ message: "Only PDF, JPG or PNG files are allowed" });
  }

  const offices = type.offices.filter((o) => o.active);
  if (!offices.length) {
    return res
      .status(400)
      .json({ message: "No offices are set for this clearance type yet. Contact the administrator." });
  }

  const active = await ClearanceRequest.findOne({
    student: req.user._id,
    status: { $in: ["In Progress", "Blocked"] },
  });
  if (active) return res.status(409).json({ message: "You already have an active request" });

  const firstStage = Math.min(...offices.map((o) => o.stage));
  const request = await ClearanceRequest.create({
    student: req.user._id,
    clearanceType: type._id,
    reason,
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

  if (req.file) {
    const fileName = Buffer.from(req.file.originalname, "latin1").toString("utf8").slice(0, 120);
    await Attachment.create({
      request: request._id,
      uploadedBy: req.user._id,
      originalName: fileName,
      mimeType: detectType(req.file.buffer),
      size: req.file.size,
      data: req.file.buffer,
    });
  }

  await request.populate("clearanceType", "name code");
  res.status(201).json(request);
});

exports.myRequests = asyncHandler(async (req, res) => {
  const requests = await ClearanceRequest.find({ student: req.user._id })
    .populate("clearanceType", "name code")
    .sort("-createdAt");
  res.json(requests);
});

exports.getRequest = asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(404).json({ message: "Request not found" });
  }
  const request = await ClearanceRequest.findById(req.params.id)
    .populate("student", "fullName universityId department")
    .populate("clearanceType", "name code");
  if (!request) return res.status(404).json({ message: "Request not found" });

  const isOwner = String(request.student._id) === String(req.user._id);
  if (!isOwner && req.user.role !== "admin") {
    return res.status(403).json({ message: "You do not have permission" });
  }

  const approvals = await Approval.find({ request: request._id })
    .populate("office", "name stage")
    .sort("stage");
  const attachments = await Attachment.find({ request: request._id }).select("originalName mimeType size createdAt");
  res.json({ request, approvals, attachments });
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

