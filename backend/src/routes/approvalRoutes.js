const router = require("express").Router();
const c = require("../controllers/approvalController");
const { protect, authorize } = require("../middleware/auth");

router.use(protect, authorize("approver"));
router.get("/queue", c.queue);
router.patch("/:id/approve", c.approve);
router.patch("/:id/reject", c.reject);

module.exports = router;
