const router = require("express").Router();
const { download } = require("../controllers/certificateController");
const { protect, authorize } = require("../middleware/auth");

router.get("/:requestId/download", protect, authorize("student", "admin"), download);

module.exports = router;
