const asyncHandler = require("express-async-handler")
const { Lecture, validateCreateLecture, validateUpdateLecture } = require("../models/Lecture")

const getAllLectures = asyncHandler(
    async (req, res) => {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const lectures = await Lecture.find()
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
        const count = await Lecture.countDocuments();
        if (lectures) {
            res.status(200).json({
                status: 'success',
                count: count,
                result: lectures,
            });
        } else {
            res.status(404).json({
                status: "error",
                message: "Lectures are not found"
            })
        }
    }
)

const getLectureById = asyncHandler(
    async (req, res) => {
        const lecture = await Lecture.findById(req.params.id)
        if (lecture) {
            res.status(200).json({
                status: 'success',
                result: lecture
            })
        } else {
            res.status(404).json({
                status: "error",
                message: "Lecture is not found"
            })
        }
    }
)

const createLecture = asyncHandler(
    async (req, res) => {
        const { error } = validateCreateLecture(req.body)
        if (error) {
            return res.status(400).json({
                status: "error",
                message: error.details[0].message
            })
        }
        const lecture = new Lecture(
            {
                title: req.body.title,
                videoUrl: req.body.videoUrl,
                duration: req.body.duration,
            }
        )
        const result = await lecture.save()
        res.status(201).json({
            status: 'success',
            result: result
        })
    }
)

const updateLecture = asyncHandler(
    async (req, res) => {
        const { error } = validateUpdateLecture(req.body)
        if (error) {
            return res.status(400).json({
                status: "error",
                message: error.details[0].message
            })
        }
        const updatedLecture = await Lecture.findByIdAndUpdate(req.params.id, {
            $set: {
                title: req.body.title,
                videoUrl: req.body.videoUrl,
                duration: req.body.duration,
            }
        }, { new: true })
        if (updatedLecture) {
            res.status(200).json({
                status: 'success',
                result: updatedLecture
            })
        } else {
            res.status(400).json({
                status: 'error',
                message: "Lecture is not found"
            })
        }
    }
)

const deleteLecture = asyncHandler(
    async (req, res) => {
        const { id } = req.params;
        const lecture = await Lecture.findByIdAndDelete(id)
        if (lecture) {
            res.status(200).json({
                status: 'success',
                message: "Lecture has been deleted"
            });
        } else {
            res.status(404).json({
                status: "error",
                message: "Lecture is not found"
            })
        }
    });

const deleteAllLectures = asyncHandler(async (req, res) => {
    await Lecture.deleteMany({});
    res.status(200).json({ message: 'All Lectures have been deleted successfully.' });
});

module.exports = {
    getAllLectures,
    getLectureById,
    createLecture,
    updateLecture,
    deleteLecture,
    deleteAllLectures
}
