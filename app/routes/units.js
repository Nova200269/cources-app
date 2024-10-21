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

// router.use(teacher);
router.route("/:id")
    .get(getUnitById)
    .put(updateUnit)
    .delete(deleteUnit)
    
router.route("/add")
    .post(createUnit)

router.route("/")
    .get(getAllUnits)
    .delete(deleteAllUnits)

module.exports = router