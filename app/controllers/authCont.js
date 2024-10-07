const bcrypt = require('bcrypt');
const { User, validateRegisterStudent, validateRegisterTeacher, validateRegisterAdmin, validateLoginUser, validateForgetPassword } = require('../models/User');
const { Otp, validateCreateOtp } = require("../models/Otp")
const { generateOtpCode } = require("../utils/functions")
const { sendOtpEmail } = require('../utils/sendEmail')
const asyncHandler = require('express-async-handler');

const generateOtp = asyncHandler(async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({
        status: "error",
        message: 'no email provided'
    });
    const { error } = validateCreateOtp(req.body);
    if (error) return res.status(400).json({
        status: "error",
        message: error.details[0].message
    });
    const isEmail = await User.findOne({ email });
    if (isEmail) return res.status(400).json({
        status: "error",
        message: 'this email already exists'
    });
    let otp = await Otp.findOne({ email });
    if (otp && otp.expireDate > new Date()) {
        // If OTP exists and is still valid, check the number of attempts         
        if (otp.attempts >= 4) {
            return res.status(429).json({
                status: "error",
                message: 'Maximum number of attempts reached. Please try again after an hour.'
            });
        } else {
            // Increment the number of attempts if it's still under the limit             
            otp.attempts += 1;
            await otp.save();
            return res.status(200).json({
                status: "success",
                message: "OTP is still valid",
            });
        }
    }
    const otpCode = "123456" // generateOtpCode()
    if (!otp) {
        // Create a new OTP if one doesn't exist         
        otp = new Otp({ email: req.body.email, code: otpCode });
    } else {
        // Update the existing OTP if it exists but has expired         
        otp.code = otpCode;
        otp.attempts = 1;  // Reset attempts for new OTP         
        otp.expireDate = new Date();  // Reset expiration date     
    }
    await otp.save();
    // await sendOtpEmail(email, otpCode);     
    res.json({ status: "success", message: 'OTP generated and sent to email', });
});

const signupStudent = asyncHandler(async (req, res) => {
    const { error } = validateRegisterStudent(req.body);
    if (error) return res.status(400).json({
        status: "error",
        message: error.details[0].message
    });
    let user = await User.findOne({ email: req.body.email });
    if (user) return res.status(400).json({
        status: "error",
        message: 'User already registered.'
    });
    const emailOtp = await Otp.findOne({
        email: req.body.email,
        code: req.body.otp,
    });
    if (!emailOtp) return res.status(400).json({
        status: "error",
        message: 'invalid otp'
    });
    await Otp.deleteOne({ _id: emailOtp._id });
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);
    user = new User({
        name: req.body.name,
        email: req.body.email,
        password: hashedPassword,
    });
    const token = user.generateAuthToken();
    const result = await user.save();
    const { password, ...other } = result._doc;
    res.status(201).json({ ...other, token });
});

const signupTeacher = asyncHandler(async (req, res) => {
    const { error } = validateRegisterTeacher(req.body);
    if (error) return res.status(400).json({
        status: "error",
        message: error.details[0].message
    });
    let user = await User.findOne({ email: req.body.email });
    if (user) return res.status(400).json({
        status: "error",
        message: 'teacher already registered.'
    });
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);
    const teacherRole = "teacher"
    user = new User({
        name: req.body.name,
        email: req.body.email,
        password: hashedPassword,
        role: teacherRole,
        image: req.body.image,
        descreption: req.body.descreption,
    });
    const token = user.generateAuthToken();
    const result = await user.save();
    const { password, ...other } = result._doc;
    res.status(201).json({ ...other, token });
});

const signupAdmin = asyncHandler(async (req, res) => {
    const { error } = validateRegisterAdmin(req.body);
    if (error) return res.status(400).json({
        status: "error",
        message: error.details[0].message
    });
    let user = await User.findOne({ email: req.body.email });
    if (user) return res.status(400).json({
        status: "error",
        message: 'Admin already registered.'
    });
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);
    const adminRole = "admin"
    user = new User({
        name: req.body.name,
        email: req.body.email,
        password: hashedPassword,
        role: adminRole,
    });
    const token = user.generateAuthToken();
    const result = await user.save();
    const { password, ...other } = result._doc;
    res.status(201).json({ ...other, token });
});

const loginUser = asyncHandler(async (req, res) => {
    const { error } = validateLoginUser(req.body);
    if (error) return res.status(400).json({
        status: "error",
        message: error.details[0].message
    });
    const user = await User.findOne({ email: req.body.email }).select('+password');
    if (!user) return res.status(400).json({
        status: "error",
        message: 'Invalid email or password.'
    });
    if (user.blocked && user.role === "student") return res.status(400).json({
        status: "error",
        message: 'student has been blocked'
    });
    if (user.blocked && user.role === "teacher") return res.status(400).json({
        status: "error",
        message: 'teacher has been blocked'
    });
    const validPassword = await bcrypt.compare(req.body.password, user.password);
    if (!validPassword) return res.status(400).json({
        status: "error",
        message: 'Invalid email or password.'
    });
    const token = user.generateAuthToken();
    const { password, ...other } = user._doc;
    res.status(200).json({ ...other, token });
});

const loginAdmin = asyncHandler(async (req, res) => {
    const { error } = validateLoginUser(req.body);
    if (error) return res.status(400).json({
        status: "error",
        message: error.details[0].message
    });
    const user = await User.findOne({ email: req.body.email }).select('+password');
    if (!user) return res.status(400).json({
        status: "error",
        message: 'Invalid email or password.'
    });
    if (user.blocked) return res.status(400).json({
        status: "error",
        message: 'admin has been blocked'
    });
    const validPassword = await bcrypt.compare(req.body.password, user.password);
    if (!validPassword) return res.status(400).json({
        status: "error",
        message: 'Invalid email or password.'
    });
    if (!user.isAdmin()) {
        return res.status(403).json({
            status: "error",
            message: 'Access denied'
        });
    }
    const token = user.generateAuthToken();
    const { password, ...other } = user._doc;
    res.status(200).json({ ...other, token });
});

const forgetPassword = asyncHandler(async (req, res) => {
    const { error } = validateForgetPassword(req.body);
    if (error) return res.status(400).json({
        status: "error",
        message: error.details[0].message
    });
    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(400).json({
        status: "error",
        message: 'Invalid email'
    });
    const emailOtp = await Otp.findOne({ email: req.body.email, code: req.body.otp });
    if (!emailOtp) return res.status(400).json({
        status: "error",
        message: 'Invalid otp'
    });
    const salt = await bcrypt.genSalt(10);
    const newHashedPassword = await bcrypt.hash(req.body.password, salt);
    user.password = newHashedPassword;
    const token = user.generateAuthToken();
    const result = await user.save();
    const { password, ...other } = result._doc;
    res.status(201).json({ ...other, token });
});

const getAllUsersByRole = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const role = req.query.role
    const users = await User.find({ role: role })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);
    const count = await User.countDocuments({ role: role });
    if (users) {
        res.status(200).json({
            status: 'success',
            count: count,
            result: users,
        });
    } else {
        res.status(404).json({
            status: "error",
            message: "users not found"
        })
    }
});

const blockUserById = asyncHandler(
    async (req, res) => {
        const user = await User.findById(req.params.id)
        if (user) {
            user.blocked = true
            await user.save();
            res.status(200).json({
                status: 'success',
                message: "user has been blocked"
            })
        } else {
            res.status(404).json({
                status: "error",
                message: "user is not found"
            })
        }
    }
)

const deleteUserById = asyncHandler(
    async (req, res) => {
        const user = await User.findByIdAndDelete(req.params.id)
        if (user) {
            res.status(200).json({
                status: 'success',
                message: "user has been deleted"
            })
        } else {
            res.status(404).json({
                status: "error",
                message: "user is not found"
            })
        }
    }
)

const deleteUserToken = asyncHandler(
    async (req, res) => {
        const user = await User.findById(req.params.id)
        if (user) {
            user.deviceToken = ""
            await user.save();
            res.status(200).json({
                status: 'success',
                message: "user's device token has been deleted"
            })
        } else {
            res.status(404).json({
                status: "error",
                message: "user is not found"
            })
        }
    }
)

const lastMounthStudents = asyncHandler(
    async (req, res) => {
        const now = new Date();
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
        const students = await User.countDocuments({
            role: "student",
            createdAt: { $gte: lastMonth, $lt: now }
        })
        if (students > 0) {
            res.status(200).json({
                status: 'success',
                result: students
            })
        } else {
            res.status(404).json({
                status: "error",
                message: "no students found"
            })
        }
    }
)

const lastYearStudents = asyncHandler(
    async (req, res) => {
        const now = new Date();
        const lastYear = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
        const students = await User.countDocuments({
            role: "student",
            createdAt: { $gte: lastYear, $lt: now }
        })
        if (students > 0) {
            res.status(200).json({
                status: 'success',
                result: students
            })
        } else {
            res.status(404).json({
                status: "error",
                message: "no students found"
            })
        }
    }
)

module.exports = {
    signupStudent,
    signupTeacher,
    signupAdmin,
    loginUser,
    loginAdmin,
    generateOtp,
    forgetPassword,
    getAllUsersByRole,
    blockUserById,
    deleteUserById,
    deleteUserToken,
    lastMounthStudents,
    lastYearStudents
};
