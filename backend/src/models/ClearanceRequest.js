const mongoose = require("mongoose");

const requestSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    reason: { type: String, enum: ["graduation", "withdrawal", "transfer"], required: true },
    status: {
      type: String,
      enum: ["Draft", "In Progress", "Blocked", "Completed", "Cancelled"],
      default: "In Progress",
    },
    currentStage: { type: Number, default: 1 },
    submittedAt: { type: Date, default: Date.now },
    completedAt: Date,
    certificate: { type: mongoose.Schema.Types.ObjectId, ref: "Certificate" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ClearanceRequest", requestSchema);
