const mongoose = require("mongoose");

const officeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    stage: { type: Number, required: true, min: 1 },
    slaHours: { type: Number, default: 48 },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Office", officeSchema);
