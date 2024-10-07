const mongoose = require('mongoose');
const joi = require("joi");
const { translate, translationArraySchema } = require("../models/Translate")
const { Course } = require("../models/Course")
const categorySchema = new mongoose.Schema({
    name: {
        type: translate,
        required: true
    },
    icon: {
        type: String,
        required: true
    },
}, { collection: "category", timestamps: true });

function validateCreateCategory(obj) {
    const schema = joi.object({
        name: translationArraySchema.required(),
        icon: joi.string().required(),
    });
    return schema.validate(obj);
}

function validateUpdateCategory(obj) {
    const schema = joi.object({
        name: translationArraySchema,
        icon: joi.string(),
    });
    return schema.validate(obj);
}

const Category = mongoose.model('Category', categorySchema);

categorySchema.pre("findByIdAndDelete", async function (next) {
    try {
        const id = this.getQuery()._id;
        const usedInCategory = await Course.exists({ category: id });
        if (usedInCategory) {
            const error = new Error(
                "Cannot delete category used in a Course"
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
    Category,
    validateCreateCategory,
    validateUpdateCategory
};
