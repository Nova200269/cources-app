const mongoose = require('mongoose');
const joi = require('joi');
const JoiObjectId = require("joi-objectid")(joi);
const { translate, translationArraySchema } = require("../models/Translate")
const { Course } = require("../models/Course")
const { CourseProgress } = require("../models/CourseProgress")

const quizSchema = new mongoose.Schema({
    name: {
        type: translate,
        required: true,
    },
    questions: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Question',
        required: true,
        select: false
    }]
}, { collection: "quiz", timestamps: true });

const Quiz = mongoose.model('Quiz', quizSchema);


quizSchema.pre("findByIdAndDelete", async function (next) {
    try {
        const id = this.getQuery()._id;
        const usedInCourse = await Course.exists({ quizzes: id });
        const usedInCourseProgress = await CourseProgress.exists({ completedQuizzes: id });
        if (usedInCourse || usedInCourseProgress) {
            const error = new Error(
                "Cannot delete quiz used in a Course or Course progress"
            );
            next(error);
        } else {
            next();
        }
    } catch (err) {
        next(err);
    }
});

function validateCreateQuiz(obj) {
    const schema = joi.object({
        name: translationArraySchema.required(),
        questions: joi.array().items(JoiObjectId()).required(),
    });
    return schema.validate(obj);
}

function validateUpdateQuiz(obj) {
    const schema = joi.object({
        name: translationArraySchema,
        questions: joi.array().items(JoiObjectId()),
    });
    return schema.validate(obj);
}

module.exports = {
    Quiz,
    validateCreateQuiz,
    validateUpdateQuiz,
};
