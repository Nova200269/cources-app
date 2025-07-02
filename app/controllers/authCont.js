const bcrypt = require('bcrypt');
const { User, validateRegisterStudent, validateRegisterTeacher, validateRegisterAdmin, validateLoginUser, validateForgetPassword } = require('../models/User');
const { Otp, validateCreateOtp } = require("../models/Otp")
const { generateOtpCode } = require("../utils/functions")
const { sendOtpEmail } = require('../utils/sendEmail')
const asyncHandler = require('express-async-handler');
const { Course } = require("../models/Course")

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
    // const isEmail = await User.findOne({ email });
    // if (isEmail) return res.status(400).json({
    //     status: "error",
    //     message: 'this email already exists'
    // });
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
        image: req.body.image,
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
        job: req.body.job,
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
    const role = req.query.role;

    const users = await User.find({ role })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();

    const count = await User.countDocuments({ role });

    if (!users || users.length === 0) {
        return res.status(404).json({
            status: "error",
            message: "users not found"
        });
    }

    const modifiedUsers = users.map(user => {
        if (user.role === "teacher") {
            return {
                ...user,
                students: 156213,
                numberOfCourses: 35,
                experiences: [
                    {
                        image: "https://marketplace.canva.com/EAFlVDzb7sA/3/0/1600w/canva-white-gold-elegant-modern-certificate-of-participation-Qn4Rei141MM.jpg",
                        title: "Senior Lecturer",
                        year: "2020",
                        description: "Taught advanced computer science topics"
                    },
                    {
                        image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQAVaGwpRTpeuRkiV8n6LIAayiDcsY-vxDnXHEJMxc7O5WsNEIEfInIuFAW_3umpSBY20I&usqp=CAU",
                        title: "Guest Speaker",
                        year: "2022",
                        description: "Presented workshops on AI and machine learning"
                    }
                ]
            };
        }
        return user;
    });

    res.status(200).json({
        status: 'success',
        count,
        result: modifiedUsers,
    });
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
const editProfile = async (req, res) => {
    try {
        const userId = req.user._id;
        const { name, email, phoneNumber } = req.body;

        if (!name || !email || !phoneNumber) {
            return res.status(400).json({
                status: "error",
                message: "name, email, and phoneNumber are required"
            });
        }

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { name, email, phoneNumber },
            { new: true, runValidators: true }
        );

        if (!updatedUser) {
            return res.status(404).json({
                status: "error",
                message: "User not found"
            });
        }

        res.status(200).json({
            status: "success",
            result: updatedUser
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            status: "error",
            message: "Server error"
        });
    }
};

const getTeacherById = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id).lean();

    if (!user) {
        return res.status(404).json({
            status: "error",
            message: "User not found"
        });
    }

    if (user.role === "teacher") {
        user.students = 156213;
        user.numberOfCourses = 35;
        user.experiences = [
            {
                image: "https://marketplace.canva.com/EAFlVDzb7sA/3/0/1600w/canva-white-gold-elegant-modern-certificate-of-participation-Qn4Rei141MM.jpg",
                title: "Senior Lecturer",
                year: "2020",
                description: "Taught advanced computer science topics"
            },
            {
                image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQAVaGwpRTpeuRkiV8n6LIAayiDcsY-vxDnXHEJMxc7O5WsNEIEfInIuFAW_3umpSBY20I&usqp=CAU",
                title: "Guest Speaker",
                year: "2022",
                description: "Presented workshops on AI and machine learning"
            }
        ];
    }
    const filter = {};
    filter.teacher = user._id;
    let courses = await Course.find(filter)
        .populate({
            path: 'units',
            populate: {
                path: 'lectures',
                populate: {
                    path: 'quiz',
                    populate: {
                        path: 'questions'
                    }
                }
            }
        })
        .populate({
            path: 'final',
            populate: {
                path: 'questions',
            }
        })
        .populate('introVideo')
        .populate('teacher')
        .populate({
            path: 'comments',
            populate: {
                path: 'user',
                select: 'name image role phoneNumber email'
            }
        })
    courses = courses.map(course => {
        const teacher = course.teacher;
        if (teacher?.role === "teacher") {
            course.teacher = {
                ...teacher.toObject(),
                students: 156213,
                numberOfCourses: 35,
                experiences: [
                    {
                        image: "https://marketplace.canva.com/EAFlVDzb7sA/3/0/1600w/canva-white-gold-elegant-modern-certificate-of-participation-Qn4Rei141MM.jpg",
                        title: "Senior Lecturer",
                        year: "2020",
                        description: "Taught advanced computer science topics"
                    },
                    {
                        image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQAVaGwpRTpeuRkiV8n6LIAayiDcsY-vxDnXHEJMxc7O5WsNEIEfInIuFAW_3umpSBY20I&usqp=CAU",
                        title: "Guest Speaker",
                        year: "2022",
                        description: "Presented workshops on AI and machine learning"
                    }
                ]
            };
        }
        return course;
    });
    res.status(200).json({
        status: 'success',
        result: user,
        courses
    });
});

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
    lastYearStudents,
    editProfile,
    getTeacherById
};
