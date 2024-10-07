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
router.route("/")
    .get(getAllUnits)
router.route("/:id")
    .get(getUnitById)

// router.use(teacher);
router.route("/:id")
    .put(teacher, updateUnit)
    .delete(teacher, deleteUnit)
router.route("/add")
    .post(teacher, createUnit)

// router.use(admin);
router.route("/")
    .delete(admin, deleteAllUnits)

module.exports = router