const router = require("express").Router();
const c = require("../controllers/requestController");
const upload = require("../middleware/upload");
const { protect, authorize } = require("../middleware/auth");

router.use(protect);
router.post("/", authorize("student"), upload, c.createRequest);
router.get("/my", authorize("student"), c.myRequests);
router.get("/:id", c.getRequest);
router.patch("/:id/resubmit", authorize("student"), c.resubmit);

module.exports = router;

