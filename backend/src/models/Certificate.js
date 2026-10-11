const mongoose = require("mongoose");

const certificateSchema = new mongoose.Schema(
  {
    serialNumber: { type: String, required: true, unique: true },
    request: { type: mongoose.Schema.Types.ObjectId, ref: "ClearanceRequest", required: true },
    student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    issuedAt: { type: Date, default: Date.now },
    pdfUrl: String,
    hash: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Certificate", certificateSchema);
