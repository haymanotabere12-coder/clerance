require("dotenv").config();
const mongoose = require("mongoose");
const Office = require("../models/Office");
const User = require("../models/User");

const offices = [
  { name: "Library", stage: 1 },
  { name: "Cafeteria", stage: 1 },
  { name: "Dormitory", stage: 1 },
  { name: "Finance", stage: 1 },
  { name: "Department Head", stage: 2 },
  { name: "Registrar", stage: 3 },
];

(async () => {
  await mongoose.connect(process.env.MONGO_URI);

  for (const o of offices) {
    const office = await Office.findOneAndUpdate({ name: o.name }, o, { upsert: true, new: true });
    const slug = o.name.toLowerCase().replace(/\s+/g, "");
    const exists = await User.findOne({ universityId: `STAFF-${slug}` });
    if (!exists) {
      await User.create({
        universityId: `STAFF-${slug}`,
        fullName: `${o.name} Officer`,
        email: `${slug}@hu.edu.et`,
        password: process.env.SEED_PASSWORD || "Password123",
        role: "approver",
        office: office._id,
      });
    }
  }

  if (!(await User.findOne({ universityId: "ADMIN001" }))) {
    await User.create({
      universityId: "ADMIN001",
      fullName: "System Admin",
      email: "admin@hu.edu.et",
      password: process.env.SEED_PASSWORD || "Password123",
      role: "admin",
    });
  }

  if (!(await User.findOne({ universityId: "UGR/0001/14" }))) {
    await User.create({
      universityId: "UGR/0001/14",
      fullName: "Test Student",
      email: "student@hu.edu.et",
      password: process.env.SEED_PASSWORD || "Password123",
      role: "student",
      department: "Computer Science",
    });
  }

  console.log("Seed complete");
  process.exit(0);
})();

