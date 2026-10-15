const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const errorHandler = require("./middleware/error");

const app = express();
app.set("trust proxy", 1);

app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL }));
app.use(express.json());
app.use(morgan("dev"));

app.get("/api/health", (req, res) => res.json({ status: "ok" }));
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/requests", require("./routes/requestRoutes"));
app.use("/api/approvals", require("./routes/approvalRoutes"));
app.use("/api/certificates", require("./routes/certificateRoutes"));
app.use("/api/clearance-types", require("./routes/clearanceTypeRoutes"));
app.use("/api/attachments", require("./routes/attachmentRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));
app.get("/api/verify/:serial", require("./controllers/certificateController").verify);

app.use(errorHandler);

module.exports = app;



