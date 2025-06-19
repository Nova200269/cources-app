const asyncHandler = require("express-async-handler")
const { Category, validateCreateCategory, validateUpdateCategory } = require("../models/Category")

const getAllCategories = asyncHandler(
    async (req, res) => {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const categories = await Category.find()
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
        const count = await Category.countDocuments();
        if (categories) {
            res.status(200).json({
                status: 'success',
                count: count,
                result: categories,
            });
        } else {
            res.status(404).json({
                status: "error",
                message: "Categories are not found"
            })
        }
    }
)

const getCategoryById = asyncHandler(
    async (req, res) => {
        const category = await Category.findById(req.params.id)
        if (category) {
            res.status(200).json({
                status: 'success',
                result: category
            })
        } else {
            res.status(404).json({
                status: "error",
                message: "Category is not found"
            })
        }
    }
)

const createCategory = asyncHandler(
    async (req, res) => {
        const { error } = validateCreateCategory(req.body)
        if (error) {
            return res.status(400).json({
                status: "error",
                message: error.details[0].message
            })
        }
        const category = new Category(
            {
                name: req.body.name,
                icon: req.body.icon,
            }
        )
        const result = await category.save()
        res.status(201).json({
            status: 'success',
            result: result
        })
    }
)

const updateCategory = asyncHandler(
    async (req, res) => {
        const { error } = validateUpdateCategory(req.body)
        if (error) {
            return res.status(400).json({
                status: "error",
                message: error.details[0].message
            })
        }
        const updatedCategory = await Category.findByIdAndUpdate(req.params.id, {
            $set: {
                name: req.body.name,
                icon: req.body.icon,
            }
        }, { new: true })
        if (updatedCategory) {
            res.status(200).json({
                status: 'success',
                result: updatedCategory
            })
        } else {
            res.status(400).json({
                status: 'error',
                message: "Category is not found"
            })
        }
    }
)

const deleteCategory = asyncHandler(
    async (req, res) => {
        const { id } = req.params;
        const category = await Category.findByIdAndDelete(id)
        if (category) {
            res.status(200).json({
                status: 'success',
                message: "Category has been deleted"
            });
        } else {
            res.status(404).json({
                status: "error",
                message: "Category is not found"
            })
        }
    });

const deleteAllCategories = asyncHandler(async (req, res) => {
    await Category.deleteMany({});
    res.status(200).json({ message: 'All Categories have been deleted successfully.' });
});

module.exports = {
    getAllCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory,
    deleteAllCategories
}
