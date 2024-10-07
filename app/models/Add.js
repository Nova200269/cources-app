const mongoose = require('mongoose');
const joi = require('joi');
const { translate, translationArraySchema } = require("../models/Translate")

const addSchema = new mongoose.Schema({
    image: {
        type: String,
        required: true,
    },
    text: {
        type: translate,
        required: true,
    },
    url: {
        type: String,
        required: true,
    }
}, { collection: "add", timestamps: true });

const Add = mongoose.model('Add', addSchema);

function validateCreateAdd(obj) {
    const schema = joi.object({
        image: joi.string().required(),
        text: translationArraySchema.required(),
        url: joi.string().required(),
    });
    return schema.validate(obj);
}

function validateUpdateAdd(obj) {
    const schema = joi.object({
        image: joi.string(),
        text: translationArraySchema,
        url: joi.string(),
    });
    return schema.validate(obj);
}

module.exports = {
    Add,
    validateCreateAdd,
    validateUpdateAdd,
};
