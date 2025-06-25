const mongoose = require('mongoose');
const joi = require("joi");
const JoiObjectId = require("joi-objectid")(joi);
const { translate, translationArraySchema } = require("../models/Translate")
const { CourseProgress } = require("../models/CourseProgress")
const { PurchasedCourses } = require("../models/PurchasedCourses")
const { Comment } = require("../models/Comment")

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
    }],
    quizzes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Quiz',
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
        ref: 'Comment',
    }],
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true,
    },
    discount: {
        type: Number,
        default: 0
    },
}, { collection: "course", timestamps: true });

courseSchema.pre("findOneAndDelete", async function (next) {
    try {
        const id = this.getQuery()._id;
        const usedInCourseProgress = await CourseProgress.exists({ course: id });
        const usedInPurchasedCourses = await PurchasedCourses.exists({ courseId: id });
        const usedInComment = await Comment.exists({ course: id });
        if (usedInCourseProgress || usedInPurchasedCourses || usedInComment) {
            const error = new Error(
                "Cannot delete course used in a Course progress, Purchased courses or Comment"
            );
            next(error);
        } else {
            next();
        }
    } catch (err) {
        next(err);
    }
});

courseSchema.pre("save", async function (next) {
    try {
        const { Lecture } = require("../models/Lecture");
        const { Category } = require("../models/Category");
        const { Unit } = require("../models/Unit");
        const { Quiz } = require("../models/Quiz");
        const { Comment } = require("../models/Comment");

        const units = this.units
        const validUnits = await Unit.find({ _id: { $in: units } });
        if (validUnits.length !== units.length) {
            return next(new Error("One or more Unit IDs are invalid"));
        }

        const quizzes = this.quizzes
        const validQuizzes = await Quiz.find({ _id: { $in: quizzes } });
        if (validQuizzes.length !== quizzes.length) {
            return next(new Error("One or more Quiz IDs are invalid"));
        }

        const comments = this.comments
        const validComments = await Comment.find({ _id: { $in: comments } });
        if (validComments.length !== comments.length) {
            return next(new Error("One or more Comment IDs are invalid"));
        }

        const validLecture = await Lecture.findById(this.introVideo);
        if (!validLecture) {
            return next(new Error("Invalid intro video ID"));
        }
        const validCategory = await Category.findById(this.category);
        if (!validCategory) {
            return next(new Error("Invalid Category ID"));
        }
        next();
    } catch (err) {
        next(err);
    }
});

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
        discount: joi.number(),
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
        discount: joi.number(),
    });
    return schema.validate(obj);
}

module.exports = {
    Course,
    validateCreateCourse,
    validateUpdateCourse,
};
