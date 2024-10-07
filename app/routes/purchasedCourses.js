const express = require("express")
const router = express.Router()
const {
    getAllPurchasedCourses,
    getPurchasedCourseById,
    createPurchasedCourse,
    updatePurchasedCourse,
    deletePurchasedCourse,
    deleteAllPurchasedCourses
} = require("../controllers/purchasedCourseCont")
const { admin, authentication } = require("../middlewares/authentication")

router.use(authentication);

router.use(admin);
router.route("/")
    .delete(deleteAllPurchasedCourses)
router.route("/:id")
    .put(updatePurchasedCourse)
    .delete(deletePurchasedCourse)
router.route("/add")
    .post(createPurchasedCourse)
router.route("/")
    .get(getAllPurchasedCourses)
router.route("/:id")
    .get(getPurchasedCourseById)

module.exports = router