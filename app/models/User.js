const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const joi = require('joi');
const { translate } = require("../models/Translate")
const { Comment } = require("../models/Comment")
const { CourseProgress } = require("../models/CourseProgress")
const { PurchasedCourses } = require("../models/PurchasedCourses")

const userSchema = new mongoose.Schema({
    name: {
        type: translate,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
        select: false
    },
    role: {
        type: String,
        enum: ['student', 'admin', 'teacher'],
        default: 'student'
    },
    phoneNumber: {
        type: String,
    },
    FCMtoken: {
        type: String,
    },
    deviceToken: {
        type: String
    },
    image: {
        type: String
    },
    descreption: {
        type: translate
    },
    blocked: {
        type: Boolean,
        default: false
    },
}, { collection: "user", timestamps: true });

userSchema.methods.isAdmin = function () {
    return this.role === 'admin';
};

userSchema.methods.isTeacher = function () {
    return this.role === 'teacher';
};

userSchema.methods.generateAuthToken = function () {
    const token = jwt.sign({ _id: this._id, role: this.role }, process.env.JWT_SECRET);
    return token;
};

const User = mongoose.model('User', userSchema);

userSchema.pre("findByIdAndDelete", async function (next) {
    try {
        const id = this.getQuery()._id;
        const usedInComment = await Comment.exists({ user: id });
        const usedInCourseProgress = await CourseProgress.exists({ user: id });
        const usedInPurchasedCourses = await PurchasedCourses.exists({ userId: id });
        if (usedInComment || usedInCourseProgress || usedInPurchasedCourses) {
            const error = new Error(
                "Cannot delete user used in a Comment, Course progress or Purchased courses"
            );
            next(error);
        } else {
            next();
        }
    } catch (err) {
        next(err);
    }
});

function validateRegisterStudent(obj) {
    const schema = joi.object({
        name: joi.array().items(joi.object({
            lang: joi.string().required(),
            value: joi.string().required(),
        })).required(),
        email: joi.string().email().required(),
        password: joi.string().pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$')).required()
            .messages({
                'string.pattern.base': 'Password must have at least 8 characters, one uppercase letter, one lowercase letter, one digit, and one special character'
            }),
        otp: joi.string().required()
    });
    return schema.validate(obj);
}

function validateRegisterTeacher(obj) {
    const schema = joi.object({
        name: joi.array().items(joi.object({
            lang: joi.string().required(),
            value: joi.string().required(),
        })).required(),
        email: joi.string().email().required(),
        password: joi.string().pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$')).required()
            .messages({
                'string.pattern.base': 'Password must have at least 8 characters, one uppercase letter, one lowercase letter, one digit, and one special character'
            }),
        image: joi.string().required(),
        descreption: joi.array().items(joi.object({
            lang: joi.string().required(),
            value: joi.string().required(),
        })).required(),
    });
    return schema.validate(obj);
}

function validateRegisterAdmin(obj) {
    const schema = joi.object({
        name: joi.array().items(joi.object({
            lang: joi.string().required(),
            value: joi.string().required(),
        })).required(),
        email: joi.string().email().required(),
        password: joi.string().pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$')).required()
            .messages({
                'string.pattern.base': 'Password must have at least 8 characters, one uppercase letter, one lowercase letter, one digit, and one special character'
            }),
    });
    return schema.validate(obj);
}

function validateLoginUser(obj) {
    const schema = joi.object({
        email: joi.string().email().required(),
        password: joi.string().required(),
    });
    return schema.validate(obj);
}

function validateForgetPassword(obj) {
    const schema = joi.object({
        email: joi.string().email().required(),
        password: joi.string().pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$')).required()
            .messages({
                'string.pattern.base': 'Password must have at least 8 characters, one uppercase letter, one lowercase letter, one digit, and one special character'
            }),
        otp: joi.string().required()
    });
    return schema.validate(obj);
}

module.exports = {
    User,
    validateRegisterStudent,
    validateRegisterTeacher,
    validateRegisterAdmin,
    validateLoginUser,
    validateForgetPassword
};
