const mongoose = require('mongoose');
const joi = require('joi');
const JoiObjectId = require("joi-objectid")(require("joi"));

const courseProgressSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: true
    },
    viewedUnits: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Unit',
    }],
    completedQuizzes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Quiz',
    }],
    completionRate: {
        type: Number,
        default: 0
    },
    lastAccessed: {
        type: Date,
        default: Date.now
    }
}, { collection: "course_progress", timestamps: true });

courseProgressSchema.pre("save", async function (next) {
    try {
        const { User } = require("../models/User");
        const { Course } = require("../models/Course");
        const { Unit } = require("../models/Unit");
        const { Quiz } = require("../models/Quiz");

        const viewedUnits = this.viewedUnits
        const validViewedUnits = await Unit.find({ _id: { $in: viewedUnits } });
        if (validViewedUnits.length !== viewedUnits.length) {
            return next(new Error("One or more Unit IDs are invalid"));
        }

        const completedQuizzes = this.completedQuizzes
        const validCompletedQuizzes = await Quiz.find({ _id: { $in: completedQuizzes } });
        if (validCompletedQuizzes.length !== completedQuizzes.length) {
            return next(new Error("One or more Quiz IDs are invalid"));
        }

        const validUser = await User.findById(this.student);
        if (!validUser) {
            return next(new Error("Invalid student ID"));
        }
        const validCourse = await Course.findById(this.course);
        if (!validCourse) {
            return next(new Error("Invalid Course ID"));
        }
        next();
    } catch (err) {
        next(err);
    }
});

const CourseProgress = mongoose.model('CourseProgress', courseProgressSchema);

function validateCreateCourseProgress(obj) {
    const schema = joi.object({
        student: JoiObjectId().required(),
        course: JoiObjectId().required(),
        viewedUnits: joi.array().items(JoiObjectId()),
        completedQuizzes: joi.array().items(JoiObjectId()),
    });
    return schema.validate(obj);
}

function validateUpdateCourseProgress(obj) {
    const schema = joi.object({
        student: JoiObjectId(),
        course: JoiObjectId(),
        viewedUnits: joi.array().items(JoiObjectId()),
        completedQuizzes: joi.array().items(JoiObjectId()),
        completionRate: joi.number(),
        lastAccessed: joi.date(),
    });
    return schema.validate(obj);
}

module.exports = {
    CourseProgress,
    validateCreateCourseProgress,
    validateUpdateCourseProgress
};
