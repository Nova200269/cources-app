const mongoose = require('mongoose');
const joi = require("joi");
const JoiObjectId = require("joi-objectid")(joi);
const { translate, translationArraySchema } = require("../models/Translate")
const { Course } = require("../models/Course")
const { Unit } = require("../models/Unit")

const lectureSchema = new mongoose.Schema({
    title: {
        type: translate,
        required: true,
    },
    videoUrl: {
        type: String,
        required: true,
    },
    duration: {
        type: Number,
        required: true,
    },
    quiz: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Quiz',
        required: true,
    },
}, { collection: "lecture", timestamps: true });

lectureSchema.pre("findOneAndDelete", async function (next) {
    try {
        const id = this.getQuery()._id;
        const usedInCourse = await Course.exists({ introVideo: id });
        const usedInUnit = await Unit.exists({ lectures: id });
        if (usedInCourse || usedInUnit) {
            const error = new Error(
                "Cannot delete lecture used in a Course or Unit"
            );
            next(error);
        } else {
            next();
        }
    } catch (err) {
        next(err);
    }
});

const Lecture = mongoose.model('Lecture', lectureSchema);

function validateCreateLecture(obj) {
    const schema = joi.object({
        title: translationArraySchema.required(),
        videoUrl: joi.string().uri().required(),
        duration: joi.number().required(),
        quiz: JoiObjectId().required(),
    });
    return schema.validate(obj);
}

function validateUpdateLecture(obj) {
    const schema = joi.object({
        title: translationArraySchema,
        videoUrl: joi.string().uri(),
        duration: joi.number(),
        quiz: JoiObjectId(),
    });
    return schema.validate(obj);
}

module.exports = {
    Lecture,
    validateCreateLecture,
    validateUpdateLecture,
};