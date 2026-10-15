const PDFDocument = require("pdfkit");
const QRCode = require("qrcode");
const ClearanceRequest = require("../models/ClearanceRequest");
const Approval = require("../models/Approval");
const Certificate = require("../models/Certificate");
const asyncHandler = require("../utils/asyncHandler");
const { ensureCertificate, makeHash } = require("../services/certificateService");

const verifyBase = () => process.env.VERIFY_BASE_URL || "http://localhost:5000/api/verify";
const fmt = (d) => new Date(d).toISOString().slice(0, 10);

exports.download = asyncHandler(async (req, res) => {
  const request = await ClearanceRequest.findById(req.params.requestId)
    .populate("student", "fullName universityId department")
    .populate("clearanceType", "name");
  if (!request) return res.status(404).json({ message: "Request not found" });

  const isOwner = String(request.student._id) === String(req.user._id);
  if (!isOwner && req.user.role !== "admin") {
    return res.status(403).json({ message: "You do not have permission" });
  }
  if (request.status !== "Completed") {
    return res.status(400).json({ message: "Clearance is not completed yet" });
  }

  const cert = await ensureCertificate(request, request.student);
  const approvals = await Approval.find({ request: request._id }).populate("office", "name").sort("stage");
  const qr = await QRCode.toBuffer(`${verifyBase()}/${cert.serialNumber}`, { width: 220, margin: 1 });
  const typeName = request.clearanceType?.name || "Student Clearance";

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename="${cert.serialNumber}.pdf"`);
  res.setHeader("X-Certificate-Serial", cert.serialNumber);

  const doc = new PDFDocument({ size: "A4", margin: 50 });
  doc.pipe(res);

  doc.font("Helvetica-Bold").fontSize(24).text("Hawassa University", { align: "center" });
  doc.moveDown(0.3).fontSize(16).text("Student Clearance Certificate", { align: "center" });

  doc.moveDown(2).font("Helvetica").fontSize(12).text("This is to certify that", { align: "center" });
  doc.moveDown(0.5).font("Helvetica-Bold").fontSize(20).text(request.student.fullName, { align: "center" });

  const dept = request.student.department ? `  |  Department: ${request.student.department}` : "";
  doc.font("Helvetica").fontSize(12).text(`ID: ${request.student.universityId}${dept}`, { align: "center" });

  doc.moveDown(1).text("has been cleared of all obligations to the university.", { align: "center" });
  doc.moveDown(0.5).font("Helvetica-Bold").text(`Clearance type: ${typeName}`, { align: "center" });

  doc.moveDown(2).font("Helvetica-Bold").text("Cleared by:");
  doc.font("Helvetica");
  approvals.forEach((a) => {
    doc.text(`- ${a.office.name}: Approved${a.actedAt ? " on " + fmt(a.actedAt) : ""}`);
  });

  const y = doc.y + 30;
  doc.image(qr, 50, y, { width: 110 });
  doc.fontSize(10);
  doc.text(`Serial: ${cert.serialNumber}`, 180, y + 20);
  doc.text(`Issued: ${fmt(cert.issuedAt)}`, 180, y + 38);
  doc.text("Scan the QR code to verify this certificate.", 180, y + 56);

  doc.end();
});

exports.verify = asyncHandler(async (req, res) => {
  const cert = await Certificate.findOne({ serialNumber: req.params.serial })
    .populate("student", "fullName universityId")
    .populate({ path: "request", populate: { path: "clearanceType", select: "name" } });
  if (!cert) return res.status(404).json({ valid: false, message: "Certificate not found" });

  const valid = cert.hash === makeHash(cert.serialNumber, cert.student, cert.issuedAt);
  res.json({
    valid,
    serialNumber: cert.serialNumber,
    studentName: cert.student.fullName,
    clearanceType: cert.request?.clearanceType?.name || null,
    issuedAt: cert.issuedAt,
  });
});
