const mongoose = require("mongoose");

const typeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    code: { type: String, required: true, unique: true, lowercase: true, trim: true },
    description: { type: String, trim: true },
    requiresReason: { type: Boolean, default: false },
    active: { type: Boolean, default: true },
    offices: [{ type: mongoose.Schema.Types.ObjectId, ref: "Office" }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("ClearanceType", typeSchema);
