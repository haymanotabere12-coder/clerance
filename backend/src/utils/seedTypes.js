require("dotenv").config();
const mongoose = require("mongoose");
const Office = require("../models/Office");
const ClearanceType = require("../models/ClearanceType");

const ALL = ["Library", "Cafeteria", "Dormitory", "Finance", "Department Head", "Registrar"];

const TYPES = [
  { name: "Withdrawal Clearance", code: "withdrawal", requiresReason: true, active: true, offices: ALL,
    description: "For students leaving the university. A reason is required." },
  { name: "Final Graduation Clearance", code: "graduation", requiresReason: false, active: true, offices: ALL,
    description: "For graduating students." },
  { name: "End-of-Year Clearance", code: "end-of-year", requiresReason: false, active: true,
    offices: ["Library", "Cafeteria", "Dormitory", "Department Head"],
    description: "For students finishing the academic year." },
  { name: "End-of-Semester Clearance", code: "end-of-semester", requiresReason: false, active: false,
    offices: ["Library", "Dormitory", "Department Head"],
    description: "Switched off until the university requires it." },
];

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  const offices = await Office.find();
  const idByName = Object.fromEntries(offices.map((o) => [o.name, o._id]));

  for (const t of TYPES) {
    const { code, ...rest } = t;
    rest.offices = t.offices.map((n) => idByName[n]).filter(Boolean);
    await ClearanceType.findOneAndUpdate({ code }, { $setOnInsert: rest }, { upsert: true });
  }
  console.log("Clearance types ready:", await ClearanceType.countDocuments());
  process.exit(0);
})();
