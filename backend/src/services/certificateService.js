const crypto = require("crypto");
const Certificate = require("../models/Certificate");
const ClearanceRequest = require("../models/ClearanceRequest");

const makeHash = (serial, student, issuedAt) =>
  crypto
    .createHash("sha256")
    .update(`${serial}|${student.universityId}|${student.fullName}|${new Date(issuedAt).toISOString()}`)
    .digest("hex");

exports.makeHash = makeHash;

exports.ensureCertificate = async (request, student) => {
  let cert = await Certificate.findOne({ request: request._id });
  if (cert) return cert;

  const count = await Certificate.countDocuments();
  const serialNumber = `HU-${new Date().getFullYear()}-${String(count + 1).padStart(6, "0")}`;
  const issuedAt = new Date();

  cert = await Certificate.create({
    serialNumber,
    request: request._id,
    student: student._id,
    issuedAt,
    hash: makeHash(serialNumber, student, issuedAt),
  });
  await ClearanceRequest.findByIdAndUpdate(request._id, { certificate: cert._id });
  return cert;
};
