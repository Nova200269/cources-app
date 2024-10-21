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

router.use(admin);

router.route("/:id")
    .get(getCategoryById)
    .put(updateCategory)
    .delete(deleteCategory)

router.route("/add")
    .post(createCategory)

router.route("/")
    .delete(deleteAllCategories)

module.exports = router