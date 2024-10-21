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

router.route("/:id")
    .get(getCourseProgressById)
    .put(updateCourseProgress)
    .delete(deleteCourseProgress)

router.route("/add")
    .post(createCourseProgress)
    
router.route("/")
    .get(getAllCourseProgresses)
    .delete(deleteAllCourseProgresses)

module.exports = router