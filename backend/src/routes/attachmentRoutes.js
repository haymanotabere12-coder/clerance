const router = require("express").Router();
const c = require("../controllers/attachmentController");
const { protect, authorize } = require("../middleware/auth");

router.get("/:id", protect, authorize("student", "approver", "admin"), c.download);

module.exports = router;
