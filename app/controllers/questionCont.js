const asyncHandler = require("express-async-handler")
const { Question, validateCreateQuestion, validateUpdateQuestion } = require("../models/Question")

const getAllQuestions = asyncHandler(
    async (req, res) => {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const questions = await Question.find()
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
        const count = await Question.countDocuments();
        if (questions) {
            res.status(200).json({
                status: 'success',
                count: count,
                result: questions,
            });
        } else {
            res.status(404).json({
                status: "error",
                message: "Questions are not found"
            })
        }
    }
)

const getQuestionById = asyncHandler(
    async (req, res) => {
        const question = await Question.findById(req.params.id)
        if (question) {
            res.status(200).json({
                status: 'success',
                result: question
            })
        } else {
            res.status(404).json({
                status: "error",
                message: "Question is not found"
            })
        }
    }
)

const createQuestion = asyncHandler(
    async (req, res) => {
        const { error } = validateCreateQuestion(req.body)
        if (error) {
            return res.status(400).json({
                status: "error",
                message: error.details[0].message
            })
        }
        const question = new Question(
            {
                text: req.body.text,
                answers: req.body.answers,
                correctAnswer: req.body.correctAnswer,
            }
        )
        const result = await question.save()
        res.status(201).json({
            status: 'success',
            result: result
        })
    }
)

const updateQuestion = asyncHandler(
    async (req, res) => {
        const { error } = validateUpdateQuestion(req.body)
        if (error) {
            return res.status(400).json({
                status: "error",
                message: error.details[0].message
            })
        }
        const updatedQuestion = await Question.findByIdAndUpdate(req.params.id, {
            $set: {
                text: req.body.text,
                answers: req.body.answers,
                correctAnswer: req.body.correctAnswer,
            }
        }, { new: true })
        if (updatedQuestion) {
            res.status(200).json({
                status: 'success',
                result: updatedQuestion
            })
        } else {
            res.status(400).json({
                status: 'error',
                message: "Question is not found"
            })
        }
    }
)

const deleteQuestion = asyncHandler(
    async (req, res) => {
        const { id } = req.params;
        const question = await Question.findByIdAndDelete(id)
        if (question) {
            res.status(200).json({
                status: 'success',
                message: "Question has been deleted"
            });
        } else {
            res.status(404).json({
                status: "error",
                message: "Question is not found"
            })
        }
    });

const deleteAllQuestions = asyncHandler(async (req, res) => {
    await Comment.deleteMany({});
    res.status(200).json({ message: 'All Questions have been deleted successfully.' });
});

module.exports = {
    getAllQuestions,
    getQuestionById,
    createQuestion,
    updateQuestion,
    deleteQuestion,
    deleteAllQuestions
}
