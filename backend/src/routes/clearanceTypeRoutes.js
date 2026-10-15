const router = require("express").Router();
const c = require("../controllers/clearanceTypeController");
const { protect, authorize } = require("../middleware/auth");

router.use(protect);
router.get("/", c.listActive);
router.get("/all", authorize("admin"), c.listAll);
router.post("/", authorize("admin"), c.create);
router.patch("/:id", authorize("admin"), c.update);

module.exports = router;
