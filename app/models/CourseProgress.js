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
