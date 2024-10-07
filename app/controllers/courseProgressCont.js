const asyncHandler = require("express-async-handler")
const { CourseProgress, validateCreateCourseProgress, validateUpdateCourseProgress } = require("../models/CourseProgress")

const getAllCourseProgresses = asyncHandler(
    async (req, res) => {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const courseProgresses = await CourseProgress.find()
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate('student')
            .populate('course')
            .populate('viewedUnits')
            .populate('completedQuizzes')
        const count = await CourseProgress.countDocuments();
        if (courseProgresses) {
            res.status(200).json({
                status: 'success',
                count: count,
                result: courseProgresses,
            });
        } else {
            res.status(404).json({
                status: "error",
                message: "Course progresses are not found"
            })
        }
    }
)

const getCourseProgressById = asyncHandler(
    async (req, res) => {
        const courseProgress = await CourseProgress.findById(req.params.id)
            .populate('student')
            .populate('course')
            .populate('viewedUnits')
            .populate('completedQuizzes')
        if (courseProgress) {
            res.status(200).json({
                status: 'success',
                result: courseProgress
            })
        } else {
            res.status(404).json({
                status: "error",
                message: "Course progress is not found"
            })
        }
    }
)

const createCourseProgress = asyncHandler(
    async (req, res) => {
        const { error } = validateCreateCourseProgress(req.body)
        if (error) {
            return res.status(400).json({
                status: "error",
                message: error.details[0].message
            })
        }
        const courseProgress = new CourseProgress(
            {
                student: req.body.student,
                course: req.body.course,
                viewedUnits: req.body.viewedUnits,
                completedQuizzes: req.body.completedQuizzes,
            }
        )
        const result = await courseProgress.save()
        res.status(201).json({
            status: 'success',
            result: result
        })
    }
)

const updateCourseProgress = asyncHandler(
    async (req, res) => {
        const { error } = validateUpdateCourseProgress(req.body)
        if (error) {
            return res.status(400).json({
                status: "error",
                message: error.details[0].message
            })
        }
        const updatedCourseProgress = await CourseProgress.findByIdAndUpdate(req.params.id, {
            $set: {
                student: req.body.student,
                course: req.body.course,
                viewedUnits: req.body.viewedUnits,
                completedQuizzes: req.body.completedQuizzes,
                completionRate: req.body.completionRate,
                lastAccessed: req.body.lastAccessed,
            }
        }, { new: true })
        if (updatedCourseProgress) {
            res.status(200).json({
                status: 'success',
                result: updatedCourseProgress
            })
        } else {
            res.status(400).json({
                status: 'error',
                message: "Course progress is not found"
            })
        }
    }
)

const deleteCourseProgress = asyncHandler(
    async (req, res) => {
        const { id } = req.params;
        const courseProgress = await CourseProgress.findByIdAndDelete(id)
        if (courseProgress) {
            res.status(200).json({
                status: 'success',
                message: "Course progress has been deleted"
            });
        } else {
            res.status(404).json({
                status: "error",
                message: "Course progress is not found"
            })
        }
    });

const deleteAllCourseProgresses = asyncHandler(async (req, res) => {
    await CourseProgress.deleteMany({});
    res.status(200).json({ message: 'All Course progresses have been deleted successfully.' });
});

module.exports = {
    getAllCourseProgresses,
    getCourseProgressById,
    createCourseProgress,
    updateCourseProgress,
    deleteCourseProgress,
    deleteAllCourseProgresses
}
