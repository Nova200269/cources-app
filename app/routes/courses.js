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
    popularCourses,
    onSaleCourses
} = require("../controllers/courseCont");
const { admin, teacher, authentication } = require("../middlewares/authentication");

router.use(authentication);

router.route("/new-courses")
    .get(newCourses);
router.route("/on-sales-courses")
    .get(onSaleCourses);
router.route("/popular-courses")
    .get(popularCourses);
router.route("/purchased-courses")
    .get(getAllPurchasedCourses);

router.route("/search")
    .get(searchCourse);
router.route("/")
    .get(getAllCourses)

router.route("/:id")
    .get(getCourseById)


router.use(admin);

router.route("/show-hide-course/:id")
    .put(showOrHideCourse);
router.route("/course-revenue/:id")
    .get(getCourseRevenue);
router.route("/all-courses-revenue")
    .get(getAllCoursesRevenue);
router.route("/add")
    .post(createCourse);

router.route("/:id")
    .put(updateCourse)
    .delete(deleteCourse);

router.route("/")
    .delete(deleteAllCourses);

module.exports = router;
