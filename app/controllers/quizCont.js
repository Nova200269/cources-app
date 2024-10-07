const asyncHandler = require("express-async-handler")
const { Quiz, validateCreateQuiz, validateUpdateQuiz } = require("../models/Quiz")

const getAllQuizzes = asyncHandler(
    async (req, res) => {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const quizzes = await Quiz.find()
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate('questions')
        const count = await Quiz.countDocuments();
        if (quizzes) {
            res.status(200).json({
                status: 'success',
                count: count,
                result: quizzes,
            });
        } else {
            res.status(404).json({
                status: "error",
                message: "quizzes are not found"
            })
        }
    }
)

const getQuizById = asyncHandler(
    async (req, res) => {
        const quiz = await Quiz.findById(req.params.id)
            .populate('questions')
        if (quiz) {
            res.status(200).json({
                status: 'success',
                result: quiz
            })
        } else {
            res.status(404).json({
                status: "error",
                message: "Quiz is not found"
            })
        }
    }
)

const createQuiz = asyncHandler(
    async (req, res) => {
        const { error } = validateCreateQuiz(req.body)
        if (error) {
            return res.status(400).json({
                status: "error",
                message: error.details[0].message
            })
        }
        const quiz = new Quiz(
            {
                name: req.body.name,
                questions: req.body.questions,
            }
        )
        const result = await quiz.save()
        res.status(201).json({
            status: 'success',
            result: result
        })
    }
)

const updateQuiz = asyncHandler(
    async (req, res) => {
        const { error } = validateUpdateQuiz(req.body)
        if (error) {
            return res.status(400).json({
                status: "error",
                message: error.details[0].message
            })
        }
        const updatedQuiz = await Quiz.findByIdAndUpdate(req.params.id, {
            $set: {
                name: req.body.name,
                questions: req.body.questions,
            }
        }, { new: true })
        if (updatedQuiz) {
            res.status(200).json({
                status: 'success',
                result: updatedQuiz
            })
        } else {
            res.status(400).json({
                status: 'error',
                message: "Quiz is not found"
            })
        }
    }
)

const deleteQuiz = asyncHandler(
    async (req, res) => {
        const { id } = req.params;
        const quiz = await Quiz.findByIdAndDelete(id)
        if (quiz) {
            res.status(200).json({
                status: 'success',
                message: "Quiz has been deleted"
            });
        } else {
            res.status(404).json({
                status: "error",
                message: "Quiz is not found"
            })
        }
    });

const deleteAllQuizzes = asyncHandler(async (req, res) => {
    await Quiz.deleteMany({});
    res.status(200).json({ message: 'All Quizzes have been deleted successfully.' });
});

module.exports = {
    getAllQuizzes,
    getQuizById,
    createQuiz,
    updateQuiz,
    deleteQuiz,
    deleteAllQuizzes
}
