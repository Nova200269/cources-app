const mongoose = require('mongoose');
const joi = require("joi");
const JoiObjectId = require("joi-objectid")(joi);

const purchasedCourseSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    courseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: true,
    },
    purchaseDate: {
        type: Date,
        default: Date.now,
    },
    price: {
        type: Number,
        required: true
    },
}, { collection: "purchased_course", timestamps: true });

function validateCreatePurchasedCourse(obj) {
    const schema = joi.object({
        userId: JoiObjectId().required(),
        courseId: JoiObjectId().required(),
        purchaseDate: joi.date(),
        price: joi.number().required(),
    });
    return schema.validate(obj);
}

function validateUpdatePurchasedCourse(obj) {
    const schema = joi.object({
        userId: JoiObjectId(),
        courseId: JoiObjectId(),
        purchaseDate: joi.date(),
        price: joi.number(),
    });
    return schema.validate(obj);
}

const PurchasedCourse = mongoose.model('PurchasedCourse', purchasedCourseSchema);

module.exports = {
    PurchasedCourse,
    validateCreatePurchasedCourse,
    validateUpdatePurchasedCourse
};