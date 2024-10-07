const mongoose = require('mongoose');
const joi = require('joi');
const { translate } = require("../models/Translate")
const { Quiz } = require("../models/Quiz")

const questionSchema = new mongoose.Schema({
    text: {
        type: String,
        required: true,
    },
    answers: [{
        type: String,
        required: true,
    }],
    correctAnswer: {
        type: String,
        required: true,
    },
}, { collection: "question", timestamps: true });

const Question = mongoose.model('Question', questionSchema);

function validateCreateQuestion(obj) {
    const schema = joi.object({
        text: joi.string().required(),
        answers: joi.array().items(joi.string()).required(),
        correctAnswer: joi.string().required(),
    });
    return schema.validate(obj);
}

function validateUpdateQuestion(obj) {
    const schema = joi.object({
        text: joi.string(),
        answers: joi.array().items(joi.string()),
        correctAnswer: joi.string(),
    });
    return schema.validate(obj);
}

questionSchema.pre("findByIdAndDelete", async function (next) {
    try {
        const id = this.getQuery()._id;
        const usedInQuiz = await Quiz.exists({ questions: id });
        if (usedInQuiz) {
            const error = new Error(
                "Cannot delete question used in a Quiz"
            );
            next(error);
        } else {
            next();
        }
    } catch (err) {
        next(err);
    }
});

module.exports = {
    Question,
    validateCreateQuestion,
    validateUpdateQuestion,
};
