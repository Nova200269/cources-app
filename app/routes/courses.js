const express = require("express");
const router = express.Router();
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
} = require("../controllers/courseCont");
const { admin, teacher, authentication } = require("../middlewares/authentication");

router.use(authentication);
router.use(admin);

router.route("/search")
    .get(searchCourse);
router.route("/show-hide-course/:id")
    .put(showOrHideCourse);
router.route("/course-revenue/:id")
    .get(getCourseRevenue);
router.route("/all-courses-revenue")
    .get(getAllCoursesRevenue);
router.route("/add")
    .post(createCourse);
router.route("/new-courses")
    .get(newCourses);
router.route("/popular-courses")
    .get(popularCourses);
router.route("/purchased-courses")
    .get(getAllPurchasedCourses);

router.route("/:id")
    .get(getCourseById)
    .put(updateCourse)
    .delete(deleteCourse);
router.route("/")
    .get(getAllCourses)
    .delete(deleteAllCourses);

module.exports = router;
