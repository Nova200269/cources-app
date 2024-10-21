const express = require("express")
const router = express.Router()
const {
    getAllLectures,
    getLectureById,
    createLecture,
    updateLecture,
    deleteLecture,
    deleteAllLectures
} = require("../controllers/lectureCont")
const { admin, teacher, authentication } = require("../middlewares/authentication")

router.use(authentication);
router.use(admin);

// router.use(teacher);
router.route("/:id")
    .get(getLectureById)
    .put(updateLecture)
    .delete(deleteLecture)

router.route("/add")
    .post(createLecture)
    
router.route("/")
    .get(getAllLectures)
    .delete(deleteAllLectures)

module.exports = router