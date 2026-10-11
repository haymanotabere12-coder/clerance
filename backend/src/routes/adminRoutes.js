const router = require("express").Router();
const c = require("../controllers/adminController");
const { protect, authorize } = require("../middleware/auth");

router.use(protect, authorize("admin"));

router.get("/offices", c.listOffices);
router.post("/offices", c.createOffice);
router.patch("/offices/:id", c.updateOffice);

router.get("/users", c.listUsers);
router.post("/users", c.createUser);
router.post("/import-students", c.importStudents);

router.get("/reports", c.reports);

module.exports = router;
