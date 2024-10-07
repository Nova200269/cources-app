const express = require("express")
const router = express.Router()
const {
    getAllCourses,
    getAllPurchasedCourses,
    getCourseById,
    createCourse,
    updateCourse,
    deleteCourse,
    deleteAllCourses,
    showOrHideCourse,
    searchCourse,
    getCourseRevenue,
    getAllCoursesRevenue,
    newCourses,
    popularCourses
} = require("../controllers/courseCont")
const { admin, teacher, authentication } = require("../middlewares/authentication")

router.use(authentication);
router.route("/")
    .get(getAllCourses)
router.route("/new-courses")
    .get(newCourses)
router.route("/popular-courses")
    .get(popularCourses)
router.route("/purchasedcourses")
    .get(getAllPurchasedCourses)
router.route("/:id")
    .get(getCourseById)
router.route("/search/:id")
    .get(searchCourse)

// router.use(teacher);
router.route("/add")
    .post(teacher, createCourse)
router.route("/:id")
    .put(teacher, updateCourse)
    .delete(teacher, deleteCourse)

// router.use(admin);
router.route("/show-hide-course/:id")
    .put(admin, showOrHideCourse)
router.route("/course-revenue")
    .get(admin, getCourseRevenue)
router.route("/all-courses-revenue")
    .get(admin, getAllCoursesRevenue)
router.route("/")
    .delete(admin, deleteAllCourses)

module.exports = router