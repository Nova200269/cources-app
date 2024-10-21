const mongoose = require('mongoose');
const joi = require("joi");
const JoiObjectId = require("joi-objectid")(joi);
const { translate, translationArraySchema } = require("../models/Translate")

const commentSchema = new mongoose.Schema({
    text: {
        type: String,
        required: true
    },
    rate: {
        type: Number,
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: true
    },
}, { collection: "comment", timestamps: true });

commentSchema.pre("findOneAndDelete", async function (next) {
    try {
        const id = this.getQuery()._id;
        const usedInCourse = await Course.exists({ comments: id });
        if (usedInCourse) {
            const error = new Error(
                "Cannot delete comment used in a Course"
            );
            next(error);
        } else {
            next();
        }
    } catch (err) {
        next(err);
    }
});

commentSchema.pre("save", async function (next) {
    try {
        const { User } = require("../models/User");
        const { Course } = require("../models/Course");
        const validUser = await User.findById(this.user);
        const validCourse = await Course.findById(this.course);
        if (!validUser) {
            return next(new Error("Invalid User ID"));
        }
        if (!validCourse) {
            return next(new Error("Invalid Course ID"));
        }
        const Comment = mongoose.model('Comment', commentSchema);
        const commentExists = await Comment.findOne({ user: this.user, course: this.course })
        if (commentExists) {
            return next(new Error("user can't make two comments on the same course"));
        }
        next();
    } catch (err) {
        next(err);
    }
});

const Comment = mongoose.model('Comment', commentSchema);

function validateCreateComment(obj) {
    const schema = joi.object({
        text: joi.string().required(),
        rate: joi.number().min(1).max(5).required(),
        user: JoiObjectId().required(),
        course: JoiObjectId().required(),
    });
    return schema.validate(obj);
}

function validateUpdateComment(obj) {
    const schema = joi.object({
        text: joi.string(),
        rate: joi.number(),
        user: JoiObjectId(),
        course: JoiObjectId(),
    });
    return schema.validate(obj);
}

module.exports = {
    Comment,
    validateCreateComment,
    validateUpdateComment
};
