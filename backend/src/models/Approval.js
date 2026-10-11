const mongoose = require("mongoose");

const approvalSchema = new mongoose.Schema(
  {
    request: { type: mongoose.Schema.Types.ObjectId, ref: "ClearanceRequest", required: true },
    office: { type: mongoose.Schema.Types.ObjectId, ref: "Office", required: true },
    stage: { type: Number, required: true },
    status: { type: String, enum: ["Waiting", "Pending", "Approved", "Rejected"], default: "Waiting" },
    approver: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    reason: String,
    attachments: [String],
    actedAt: Date,
  },
  { timestamps: true }
);

approvalSchema.index({ request: 1, office: 1 }, { unique: true });

module.exports = mongoose.model("Approval", approvalSchema);
