const asyncHandler = require("express-async-handler")
const { Comment, validateCreateComment, validateUpdateComment } = require("../models/Comment")

const getAllComments = asyncHandler(
    async (req, res) => {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const comments = await Comment.find()
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate('user')
        const count = await Comment.countDocuments();
        if (comments) {
            res.status(200).json({
                status: 'success',
                count: count,
                result: comments,
            });
        } else {
            res.status(404).json({
                status: "error",
                message: "Comments are not found"
            })
        }
    }
)

const getCommentById = asyncHandler(
    async (req, res) => {
        const comment = await Comment.findById(req.params.id).populate('user')
        if (comment) {
            res.status(200).json({
                status: 'success',
                result: comment
            })
        } else {
            res.status(404).json({
                status: "error",
                message: "Comment is not found"
            })
        }
    }
)

const createComment = asyncHandler(
    async (req, res) => {
        const { error } = validateCreateComment(req.body)
        if (error) {
            return res.status(400).json({
                status: "error",
                message: error.details[0].message
            })
        }
        const comment = new Comment(
            {
                text: req.body.text,
                rate: req.body.rate,
                user: req.body.user,
            }
        )
        const result = await comment.save()
        res.status(201).json({
            status: 'success',
            result: result
        })
    }
)

const updateComment = asyncHandler(
    async (req, res) => {
        const { error } = validateUpdateComment(req.body)
        if (error) {
            return res.status(400).json({
                status: "error",
                message: error.details[0].message
            })
        }
        const updatedComment = await Comment.findByIdAndUpdate(req.params.id, {
            $set: {
                text: req.body.text,
                rate: req.body.rate,
                user: req.body.user,
            }
        }, { new: true })
        if (updatedComment) {
            res.status(200).json({
                status: 'success',
                result: updatedComment
            })
        } else {
            res.status(400).json({
                status: 'error',
                message: "Comment is not found"
            })
        }
    }
)

const deleteComment = asyncHandler(
    async (req, res) => {
        const { id } = req.params;
        const comment = await Comment.findByIdAndDelete(id)
        if (comment) {
            res.status(200).json({
                status: 'success',
                message: "Comment has been deleted"
            });
        } else {
            res.status(404).json({
                status: "error",
                message: "Comment is not found"
            })
        }
    });

const deleteAllComments = asyncHandler(async (req, res) => {
    await Comment.deleteMany({});
    res.status(200).json({ message: 'All Comments have been deleted successfully.' });
});

module.exports = {
    getAllComments,
    getCommentById,
    createComment,
    updateComment,
    deleteComment,
    deleteAllComments
}
