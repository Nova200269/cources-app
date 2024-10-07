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
    }
}, { collection: "comment", timestamps: true });

const Comment = mongoose.model('Comment', commentSchema);

function validateCreateComment(obj) {
    const schema = joi.object({
        text: joi.string().required(),
        rate: joi.number().min(1).max(5).required(),
        user: JoiObjectId().required(),
    });
    return schema.validate(obj);
}

function validateUpdateComment(obj) {
    const schema = joi.object({
        text: joi.string(),
        rate: joi.number(),
        user: JoiObjectId(),
    });
    return schema.validate(obj);
}

commentSchema.pre("findByIdAndDelete", async function (next) {
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

module.exports = {
    Comment,
    validateCreateComment,
    validateUpdateComment
};
