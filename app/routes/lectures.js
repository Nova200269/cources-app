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

router.route("/")
    .get(getAllLectures)
router.route("/:id")
    .get(getLectureById)

// router.use(teacher);
router.route("/:id")
    .put(teacher, updateLecture)
    .delete(teacher, deleteLecture)
router.route("/add")
    .post(teacher, createLecture)

router.route("/")
    .delete(admin, deleteAllLectures)
module.exports = router