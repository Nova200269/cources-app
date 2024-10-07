const mongoose = require('mongoose');
const joi = require('joi');
const { sendOtpEmail } = require("../utils/sendEmail")
const otpSchema = new mongoose.Schema({
    email: {
        type: String,
        unique: true,
        required: true
    },
    code: {
        type: String,
        default: "123456"
    },
    attempts: {
        type: Number,
        default: 1
    },
    expireDate: {
        type: Date,
        default: Date.now,
        expires: 300 // Expires after 5 minutes
    }
}, { collection: "otp", timestamps: true });

// otpSchema.pre("save", async function () {
//     sendOtpEmail(
//         this.email,
//         "the OTP",
//         `Your OTP for verification is: ${this.code}`
//     ).then();
// });

const Otp = mongoose.model('Otp', otpSchema);

function validateCreateOtp(obj) {
    const schema = joi.object({
        email: joi.string().email().required()
    });
    return schema.validate(obj);
}

module.exports = {
    Otp,
    validateCreateOtp
};