const asyncHandler = require("express-async-handler")
const { PurchasedCourse, validateCreatePurchasedCourse, validateUpdatePurchasedCourse } = require("../models/PurchasedCourses")

const getAllPurchasedCourses = asyncHandler(
    async (req, res) => {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const purchasedCourses = await PurchasedCourse.find()
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate('userId')
            .populate('courseId')
        const count = await PurchasedCourse.countDocuments();
        if (purchasedCourses) {
            res.status(200).json({
                status: 'success',
                count: count,
                result: purchasedCourses,
            });
        } else {
            res.status(404).json({
                status: "error",
                message: "Purchased courses are not found"
            })
        }
    }
)

const getPurchasedCourseById = asyncHandler(
    async (req, res) => {
        const purchasedCourse = await PurchasedCourse.findById(req.params.id)
            .populate('userId')
            .populate('courseId')
        if (purchasedCourse) {
            res.status(200).json({
                status: 'success',
                result: purchasedCourse
            })
        } else {
            res.status(404).json({
                status: "error",
                message: "Purchased course is not found"
            })
        }
    }
)

const createPurchasedCourse = asyncHandler(
    async (req, res) => {
        const { error } = validateCreatePurchasedCourse(req.body)
        if (error) {
            return res.status(400).json({
                status: "error",
                message: error.details[0].message
            })
        }
        const purchasedCourse = new PurchasedCourse(
            {
                userId: req.body.userId,
                courseId: req.body.courseId,
                purchaseDate: req.body.purchaseDate,
                price: req.body.price,
            }
        )
        const result = await purchasedCourse.save()
        res.status(201).json({
            status: 'success',
            result: result
        })
    }
)

const updatePurchasedCourse = asyncHandler(
    async (req, res) => {
        const { error } = validateUpdatePurchasedCourse(req.body)
        if (error) {
            return res.status(400).json({
                status: "error",
                message: error.details[0].message
            })
        }
        const updatedPurchasedCourse = await PurchasedCourse.findByIdAndUpdate(req.params.id, {
            $set: {
                userId: req.body.userId,
                courseId: req.body.courseId,
                purchaseDate: req.body.purchaseDate,
                price: req.body.price,
            }
        }, { new: true })
        if (updatedPurchasedCourse) {
            res.status(200).json({
                status: 'success',
                result: updatedPurchasedCourse
            })
        } else {
            res.status(400).json({
                status: 'error',
                message: "Purchased course is not found"
            })
        }
    }
)

const deletePurchasedCourse = asyncHandler(
    async (req, res) => {
        const { id } = req.params;
        const purchasedCourse = await PurchasedCourse.findByIdAndDelete(id)
        if (purchasedCourse) {
            res.status(200).json({
                status: 'success',
                message: "Purchased course has been deleted"
            });
        } else {
            res.status(404).json({
                status: "error",
                message: "Purchased course is not found"
            })
        }
    });

const deleteAllPurchasedCourses = asyncHandler(async (req, res) => {
    await PurchasedCourse.deleteMany({});
    res.status(200).json({ message: 'All Purchased courses have been deleted successfully.' });
});

module.exports = {
    getAllPurchasedCourses,
    getPurchasedCourseById,
    createPurchasedCourse,
    updatePurchasedCourse,
    deletePurchasedCourse,
    deleteAllPurchasedCourses
}
