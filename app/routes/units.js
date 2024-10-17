const express = require("express")
const router = express.Router()
const {
    getAllUnits,
    getUnitById,
    createUnit,
    updateUnit,
    deleteUnit,
    deleteAllUnits
} = require("../controllers/unitCont")
const { admin, teacher, authentication } = require("../middlewares/authentication")

router.use(authentication);
router.use(admin);

router.route("/")
    .get(getAllUnits)
router.route("/:id")
    .get(getUnitById)

// router.use(teacher);
router.route("/:id")
    .put(updateUnit)
    .delete(deleteUnit)
router.route("/add")
    .post(createUnit)

router.route("/")
    .delete(deleteAllUnits)

module.exports = router