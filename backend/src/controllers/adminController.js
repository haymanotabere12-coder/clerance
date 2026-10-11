const { z } = require("zod");
const Office = require("../models/Office");
const User = require("../models/User");
const ClearanceRequest = require("../models/ClearanceRequest");
const Approval = require("../models/Approval");
const asyncHandler = require("../utils/asyncHandler");

const officeSchema = z.object({
  name: z.string().min(2),
  stage: z.number().int().min(1),
  slaHours: z.number().min(1).optional(),
  active: z.boolean().optional(),
});

const userSchema = z.object({
  universityId: z.string().min(3),
  fullName: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  password: z.string().min(6),
  role: z.enum(["student", "approver", "admin"]),
  department: z.string().optional(),
  office: z.string().optional(),
});

const studentRowSchema = z.object({
  universityId: z.string().min(3),
  fullName: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  department: z.string().optional(),
});

exports.listOffices = asyncHandler(async (req, res) => {
  res.json(await Office.find().sort("stage name"));
});

exports.createOffice = asyncHandler(async (req, res) => {
  const parsed = officeSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: parsed.error.issues[0].message });
  res.status(201).json(await Office.create(parsed.data));
});

exports.updateOffice = asyncHandler(async (req, res) => {
  const parsed = officeSchema.partial().safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: parsed.error.issues[0].message });
  const office = await Office.findByIdAndUpdate(req.params.id, parsed.data, {
    new: true,
    runValidators: true,
  });
  if (!office) return res.status(404).json({ message: "Office not found" });
  res.json(office);
});

exports.listUsers = asyncHandler(async (req, res) => {
  const filter = req.query.role ? { role: req.query.role } : {};
  res.json(await User.find(filter).populate("office", "name").sort("role universityId"));
});

exports.createUser = asyncHandler(async (req, res) => {
  const parsed = userSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: parsed.error.issues[0].message });
  if (parsed.data.role === "approver" && !parsed.data.office) {
    return res.status(400).json({ message: "An approver needs an office id" });
  }
  const user = await User.create(parsed.data);
  res.status(201).json({
    id: user._id,
    universityId: user.universityId,
    fullName: user.fullName,
    role: user.role,
  });
});

exports.importStudents = asyncHandler(async (req, res) => {
  const rows = req.body.students;
  if (!Array.isArray(rows) || !rows.length) {
    return res.status(400).json({ message: "Send a non-empty students array" });
  }

  let created = 0;
  const failed = [];

  for (const row of rows) {
    const parsed = studentRowSchema.safeParse(row);
    if (!parsed.success) {
      failed.push({ universityId: row.universityId, error: parsed.error.issues[0].message });
      continue;
    }
    try {
      await User.create({ ...parsed.data, password: parsed.data.universityId, role: "student" });
      created++;
    } catch (err) {
      failed.push({
        universityId: row.universityId,
        error: err.code === 11000 ? "Already exists" : err.message,
      });
    }
  }

  res.status(201).json({ created, failedCount: failed.length, failed });
});

exports.reports = asyncHandler(async (req, res) => {
  const byStatus = await ClearanceRequest.aggregate([
    { $group: { _id: "$status", count: { $sum: 1 } } },
    { $project: { _id: 0, status: "$_id", count: 1 } },
  ]);

  const completed = await ClearanceRequest.aggregate([
    { $match: { status: "Completed" } },
    { $group: { _id: null, avgMs: { $avg: { $subtract: ["$completedAt", "$submittedAt"] } } } },
  ]);
  const avgCompletionHours = completed.length
    ? Math.round((completed[0].avgMs / 3600000) * 100) / 100
    : null;

  const perOffice = await Approval.aggregate([
    {
      $group: {
        _id: "$office",
        pending: { $sum: { $cond: [{ $eq: ["$status", "Pending"] }, 1, 0] } },
        approved: { $sum: { $cond: [{ $eq: ["$status", "Approved"] }, 1, 0] } },
        rejected: { $sum: { $cond: [{ $eq: ["$status", "Rejected"] }, 1, 0] } },
      },
    },
    { $lookup: { from: "offices", localField: "_id", foreignField: "_id", as: "office" } },
    { $unwind: "$office" },
    {
      $project: {
        _id: 0,
        office: "$office.name",
        stage: "$office.stage",
        pending: 1,
        approved: 1,
        rejected: 1,
      },
    },
    { $sort: { stage: 1 } },
  ]);

  const topRejectionReasons = await Approval.aggregate([
    { $match: { status: "Rejected", reason: { $exists: true } } },
    { $group: { _id: "$reason", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 5 },
    { $project: { _id: 0, reason: "$_id", count: 1 } },
  ]);

  res.json({ byStatus, avgCompletionHours, perOffice, topRejectionReasons });
});
