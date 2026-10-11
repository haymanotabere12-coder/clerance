const jwt = require("jsonwebtoken");
const { z } = require("zod");
const User = require("../models/User");
const asyncHandler = require("../utils/asyncHandler");

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });

const registerSchema = z.object({
  universityId: z.string().min(3),
  fullName: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  password: z.string().min(6),
  department: z.string().optional(),
});

const loginSchema = z.object({
  universityId: z.string().min(1),
  password: z.string().min(1),
});

exports.register = asyncHandler(async (req, res) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: parsed.error.issues[0].message });
  }
  const user = await User.create({ ...parsed.data, role: "student" });
  res.status(201).json({
    token: signToken(user._id),
    user: { id: user._id, fullName: user.fullName, role: user.role },
  });
});

exports.login = asyncHandler(async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: parsed.error.issues[0].message });
  }
  const user = await User.findOne({ universityId: parsed.data.universityId }).select("+password");
  if (!user || !(await user.matchPassword(parsed.data.password))) {
    return res.status(401).json({ message: "Wrong university ID or password" });
  }
  res.json({
    token: signToken(user._id),
    user: { id: user._id, fullName: user.fullName, role: user.role, office: user.office },
  });
});

exports.me = asyncHandler(async (req, res) => {
  res.json({ user: req.user });
});
