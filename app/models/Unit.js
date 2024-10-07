const mongoose = require('mongoose');
const joi = require('joi');
const JoiObjectId = require("joi-objectid")(joi);
const { translate, translationArraySchema } = require("../models/Translate")
const { Course } = require("../models/Course")
const { CourseProgress } = require("../models/CourseProgress")

const unitSchema = new mongoose.Schema({
    name: {
        type: translate,
        required: true,
    },
    lectures: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Lecture',
        required: true,
        select: false
    }]
}, { collection: "unit", timestamps: true });

const Unit = mongoose.model('Unit', unitSchema);

function validateCreateUnit(obj) {
    const schema = joi.object({
        name: translationArraySchema.required(),
        lectures: joi.array().items(JoiObjectId()).required(),
    });
    return schema.validate(obj);
}

function validateUpdateUnit(obj) {
    const schema = joi.object({
        name: translationArraySchema,
        lectures: joi.array().items(JoiObjectId()),
    });
    return schema.validate(obj);
}

unitSchema.pre("findByIdAndDelete", async function (next) {
    try {
        const id = this.getQuery()._id;
        const usedInCourse = await Course.exists({ units: id });
        const usedInCourseProgress = await CourseProgress.exists({ viewedUnits: id });
        if (usedInCourse || usedInCourseProgress) {
            const error = new Error(
                "Cannot delete unit used in a Course or Course progress"
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
    Unit,
    validateCreateUnit,
    validateUpdateUnit,
};
