const express = require("express")
const router = express.Router()
const {
    getAllCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory,
    deleteAllCategories
} = require("../controllers/categoryCont")
const { admin, authentication } = require("../middlewares/authentication")

router.use(authentication);
router.route("/")
    .get(getAllCategories)
router.route("/:id")
    .get(getCategoryById)

router.use(admin);
router.route("/")
    .delete(deleteAllCategories)
router.route("/:id")
    .put(updateCategory)
    .delete(deleteCategory)
router.route("/add")
    .post(createCategory)

module.exports = router