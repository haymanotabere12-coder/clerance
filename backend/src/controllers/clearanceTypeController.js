const mongoose = require("mongoose");
const { z } = require("zod");
const ClearanceType = require("../models/ClearanceType");
const asyncHandler = require("../utils/asyncHandler");

const idList = z.array(z.string().refine((v) => mongoose.isValidObjectId(v), "Invalid office id"));

const baseSchema = z.object({
  name: z.string().trim().min(3),
  code: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9-]+$/, "Code can use letters, numbers and dashes only"),
  description: z.string().trim().optional(),
  requiresReason: z.boolean().optional(),
  active: z.boolean().optional(),
  offices: idList.optional(),
});

const byStage = (a, b) => a.stage - b.stage;

exports.listActive = asyncHandler(async (req, res) => {
  const types = await ClearanceType.find({ active: true })
    .populate("offices", "name stage active")
    .sort("name");
  res.json(
    types.map((t) => ({
      ...t.toObject(),
      offices: t.offices.filter((o) => o.active).sort(byStage),
    }))
  );
});

exports.listAll = asyncHandler(async (req, res) => {
  const types = await ClearanceType.find().populate("offices", "name stage active").sort("name");
  res.json(types.map((t) => ({ ...t.toObject(), offices: [...t.offices].sort(byStage) })));
});

exports.create = asyncHandler(async (req, res) => {
  const parsed = baseSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: parsed.error.issues[0].message });
  res.status(201).json(await ClearanceType.create(parsed.data));
});

exports.update = asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(404).json({ message: "Clearance type not found" });
  }
  const parsed = baseSchema.partial().safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: parsed.error.issues[0].message });
  const type = await ClearanceType.findByIdAndUpdate(req.params.id, parsed.data, {
    new: true,
    runValidators: true,
  });
  if (!type) return res.status(404).json({ message: "Clearance type not found" });
  res.json(type);
});
