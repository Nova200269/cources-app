const mongoose = require('mongoose');
const joi = require("joi");
const JoiObjectId = require("joi-objectid")(joi);
const { translate, translationArraySchema } = require("../models/Translate")
const { CourseProgress } = require("../models/CourseProgress")
const { PurchasedCourses } = require("../models/PurchasedCourses")

const courseSchema = new mongoose.Schema({
    name: {
        type: translate,
        required: true,
    },
    description: {
        type: translate,
        required: true,
    },
    image: {
        type: String,
        required: true,
    },
    teacherName: {
        type: translate,
        required: true,
    },
    hours: {
        type: Number,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    rate: {
        type: Number,
        default: 0
    },
    units: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Unit',
        select: false
    }],
    quizzes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Quiz',
        select: false
    }],
    hidden: {
        type: Boolean,
        default: false
    },
    introVideo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Lecture',
        required: true,
    },
    comments: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comments',
        select: false
    }],
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true,
    }
}, { collection: "course", timestamps: true });

const Course = mongoose.model('Course', courseSchema);

function validateCreateCourse(obj) {
    const schema = joi.object({
        name: translationArraySchema.required(),
        description: translationArraySchema.required(),
        image: joi.string().required(),
        teacherName: translationArraySchema.required(),
        hours: joi.number().required(),
        price: joi.number().required(),
        rate: joi.number().min(1).max(5),
        units: joi.array().items(JoiObjectId()),
        quizzes: joi.array().items(JoiObjectId()),
        introVideo: JoiObjectId().required(),
        comments: joi.array().items(JoiObjectId()),
        category: JoiObjectId().required(),
    });
    return schema.validate(obj);
}

function validateUpdateCourse(obj) {
    const schema = joi.object({
        name: translationArraySchema,
        description: translationArraySchema,
        image: joi.string(),
        teacherName: translationArraySchema,
        hours: joi.number(),
        price: joi.number(),
        rate: joi.number().min(1).max(5),
        units: joi.array().items(JoiObjectId()),
        quizzes: joi.array().items(JoiObjectId()),
        introVideo: JoiObjectId(),
        comments: joi.array().items(JoiObjectId()),
        category: JoiObjectId(),
    });
    return schema.validate(obj);
}

courseSchema.pre("findByIdAndDelete", async function (next) {
    try {
        const id = this.getQuery()._id;
        const usedInCourseProgress = await CourseProgress.exists({ course: id });
        const usedInPurchasedCourses = await PurchasedCourses.exists({ courseId: id });
        if (usedInCourseProgress || usedInPurchasedCourses) {
            const error = new Error(
                "Cannot delete course used in a Course progress or Purchased courses"
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
    Course,
    validateCreateCourse,
    validateUpdateCourse,
};
