const express = require("express")
const router = express.Router()
const {
    getAllCourseProgresses,
    getCourseProgressById,
    createCourseProgress,
    updateCourseProgress,
    deleteCourseProgress,
    deleteAllCourseProgresses
} = require("../controllers/courseProgressCont")
const { admin, authentication } = require("../middlewares/authentication")

router.use(authentication);

router.use(admin);
router.route("/")
    .delete(deleteAllCourseProgresses)
router.route("/:id")
    .put(updateCourseProgress)
    .delete(deleteCourseProgress)
router.route("/add")
    .post(createCourseProgress)
router.route("/")
    .get(getAllCourseProgresses)
router.route("/:id")
    .get(getCourseProgressById)
module.exports = router