const Approval = require("../models/Approval");
const ClearanceRequest = require("../models/ClearanceRequest");

exports.advance = async (requestId) => {
  const approvals = await Approval.find({ request: requestId });
  const request = await ClearanceRequest.findById(requestId);

  if (approvals.every((a) => a.status === "Approved")) {
    request.status = "Completed";
    request.completedAt = new Date();
    await request.save();
    return request;
  }

  const stageDone = approvals
    .filter((a) => a.stage === request.currentStage)
    .every((a) => a.status === "Approved");

  if (stageDone) {
    const waiting = approvals.filter((a) => a.status === "Waiting");
    if (waiting.length) {
      const next = Math.min(...waiting.map((a) => a.stage));
      await Approval.updateMany(
        { request: requestId, stage: next, status: "Waiting" },
        { status: "Pending" }
      );
      request.currentStage = next;
    }
  }

  request.status = approvals.some((a) => a.status === "Rejected") ? "Blocked" : "In Progress";
  await request.save();
  return request;
};
