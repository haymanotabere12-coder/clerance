const mongoose = require("mongoose");
const Attachment = require("../models/Attachment");
const ClearanceRequest = require("../models/ClearanceRequest");
const Approval = require("../models/Approval");
const asyncHandler = require("../utils/asyncHandler");

exports.download = asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(404).json({ message: "File not found" });
  }
  const file = await Attachment.findById(req.params.id).select("+data");
  if (!file) return res.status(404).json({ message: "File not found" });

  const request = await ClearanceRequest.findById(file.request);
  let allowed = req.user.role === "admin" || String(request?.student) === String(req.user._id);
  if (!allowed && req.user.role === "approver") {
    allowed = !!(await Approval.exists({ request: file.request, office: req.user.office }));
  }
  if (!allowed) return res.status(403).json({ message: "You do not have permission" });

  const safeName = file.originalName.replace(/[^\w.\- ]/g, "_");
  res.setHeader("Content-Type", file.mimeType);
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Content-Disposition", `attachment; filename="${safeName}"`);
  res.send(file.data);
});
