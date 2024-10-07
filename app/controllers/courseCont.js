const asyncHandler = require("express-async-handler")
const { Course, validateCreateCourse, validateUpdateCourse } = require("../models/Course")
const { PurchasedCourse } = require("../models/PurchasedCourses")
const { Language, getTranslation } = require("../models/Translate")

const getAllCourses = asyncHandler(
    async (req, res) => {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        if (req.user.role === "admin") {
            const courses = await Course.find()
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .select('+units +quizzes')
                .populate('units')
                .populate('quizzes')
                .populate('introVideo')
                .populate('comments')
                .populate('category')
            const count = await Course.countDocuments();
            if (courses) {
                res.status(200).json({
                    status: 'success',
                    count: count,
                    result: courses,
                });
            } else {
                res.status(404).json({
                    status: "error",
                    message: "Courses are not found"
                })
            }
        } else {
            const courses = await Course.find({ hidden: false })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .populate('introVideo')
                .populate('comments')
                .populate('category')
            const count = await Course.countDocuments();
            if (courses) {
                res.status(200).json({
                    status: 'success',
                    count: count,
                    result: courses,
                });
            } else {
                res.status(404).json({
                    status: "error",
                    message: "Courses are not found"
                })
            }
        }
    }
)

const getAllPurchasedCourses = asyncHandler(
    async (req, res) => {
        const userId = req.user._id;
        const userLang = req.query.lang || 'en';
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        // Fetch all purchased course IDs by the user
        const purchasedCourses = await PurchasedCourse.find({ userId }).select('courseId');
        const courseIds = purchasedCourses.map(purchase => purchase.courseId);
        if (courseIds.length === 0) {
            return res.status(404).json({
                status: 'error',
                message: 'No purchased courses found for this user',
            });
        }
        // Find the courses that match the purchased course IDs
        const courses = await Course.find({ _id: { $in: courseIds } })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .select('+units +quizzes')
            .populate('units')
            .populate('quizzes')
            .populate('introVideo')
            .populate('comments')
            .populate('category')
        const count = await Course.countDocuments({ _id: { $in: courseIds } });
        if (!courses || courses.length === 0) {
            return res.status(404).json({
                status: 'error',
                message: 'Courses not found',
            });
        }
        // Process and translate the courses for the user
        const result = courses.map((course) => ({
            name: getTranslation(course.name, userLang),
            description: getTranslation(course.description, userLang),
            teacherName: getTranslation(course.teacherName, userLang),
            image: course.image,
            hours: course.hours,
            price: course.price,
            units: course.units,
            quizzes: course.quizzes,
            introVideo: course.quizzes,
        }));
        return res.status(200).json({
            status: 'success',
            count,
            result,
        });
    }
);

const getCourseById = asyncHandler(
    async (req, res) => {
        const { courseId } = req.params;
        const userId = req.user._id;
        let userLang = req.query.lang || 'en';
        const islang = await Language.find({ code: userLang })
        if (!islang) userLang = 'en'
        const hasPurchased = await PurchasedCourse.findOne({ userId, courseId });
        if (!hasPurchased || req.user.role !== "admin") {
            const course = await Course.findById(courseId)
            .populate('introVideo')
            .populate('comments')
            .populate('category')
            if (!course || course.hidden) {
                return res.status(404).json({
                    status: 'error',
                    message: 'Course not found'
                });
            }
            const response = {
                name: getTranslation(course.name, userLang),
                description: getTranslation(course.description, userLang),
                teacherName: getTranslation(course.teacherName, userLang),
                image: course.image,
                hours: course.hours,
                price: course.price,
                rate: course.rate,
                units: course.units,
                quizzes: course.quizzes,
                introVideo: course.quizzes,
            };
            return res.status(200).json({
                status: 'success',
                result: response
            });
        }
        const course = await Course.findById(courseId)
            .select('+units +quizzes')
            .populate('units')
            .populate('quizzes')
            .populate('introVideo')
            .populate('comments')
            .populate('category')
        if (course) {
            res.status(200).json({
                status: 'success',
                result: course
            })
        } else {
            res.status(400).json({
                status: 'error',
                message: "Course is not found"
            })
        }
    }
)

const createCourse = asyncHandler(
    async (req, res) => {
        const { error } = validateCreateCourse(req.body);
        if (error) {
            return res.status(400).json({
                status: "error",
                message: error.details[0].message,
            });
        }
        const { name, description, teacherName } = req.body;
        const translations = [name, description, teacherName];
        for (const field of translations) {
            for (const translation of field) {
                const existingLang = await Language.findOne({ code: translation.lang });
                if (!existingLang) {
                    await new Language({ code: translation.lang }).save();
                }
            }
        }
        const course = new Course({
            name,
            description,
            image: req.body.image,
            teacherName,
            hours: req.body.hours,
            price: req.body.price,
            rate: req.body.rate,
            units: req.body.units,
            quizzes: req.body.quizzes,
            introVideo: req.body.introVideo,
            comments: req.body.comments,
            category: req.body.category,
        });
        const result = await course.save();
        res.status(201).json({
            status: 'success',
            result: result,
        });
    }
);


const updateCourse = asyncHandler(
    async (req, res) => {
        const { error } = validateUpdateCourse(req.body)
        if (error) {
            return res.status(400).json({
                status: "error",
                message: error.details[0].message
            })
        }
        const updatedCourse = await Course.findByIdAndUpdate(req.params.id, {
            $set: {
                name: req.body.name,
                description: req.body.description,
                image: req.body.image,
                teacherName: req.body.teacherName,
                hours: req.body.hours,
                price: req.body.price,
                rate: req.body.rate,
                units: req.body.units,
                quizzes: req.body.quizzes,
                introVideo: req.body.introVideo,
                comments: req.body.comments,
                category: req.body.category,
            }
        }, { new: true })
        if (updatedCourse) {
            res.status(200).json({
                status: 'success',
                result: updatedCourse
            })
        } else {
            res.status(400).json({
                status: 'error',
                message: "Course is not found"
            })
        }
    }
)

const deleteCourse = asyncHandler(
    async (req, res) => {
        const { id } = req.params;
        const course = await Course.findByIdAndDelete(id)
        if (course) {
            res.status(200).json({
                status: 'success',
                message: "Course has been deleted"
            });
        } else {
            res.status(404).json({
                status: "error",
                message: "Course is not found"
            })
        }
    });

const deleteAllCourses = asyncHandler(async (req, res) => {
    await Course.deleteMany({});
    res.status(200).json({ message: 'All Courses have been deleted successfully.' });
});

const showOrHideCourse = asyncHandler(async (req, res) => {
    const course = await Course.findById(req.params.id)
    if (course) {
        const hide = req.query.hide
        const text = hide === true ? "hidden" : "visible"
        course.hidden = hide
        await course.save()
        res.status(200).json({
            status: 'success',
            message: `Course is now ${text}`
        });
    } else {
        res.status(404).json({
            status: "error",
            message: "Course is not found"
        })
    }
});

const searchCourse = asyncHandler(async (req, res) => {
    const name = req.query.name;
    if (!name) return res.status(400).json({
        status: 'error',
        message: 'Search query is required'
    });
    const regex = new RegExp(name, 'i');
    const courses = await Course.find({
        $or: [
            { 'name.value': { $regex: regex } },
            { 'teacherName.value': { $regex: regex } }
        ]
    }).populate('introVideo');
    if (courses > 0) {
        return res.status(200).json({
            status: 'success',
            result: courses
        });
    } else {
        return res.status(400).json({
            status: 'error',
            message: "no course was found"
        });
    }
});

const getCourseRevenue = asyncHandler(async (req, res) => {
    const { courseId } = req.params.id
    if (!courseId) return res.status(400).json({
        status: 'error',
        message: "Course id is required"
    });
    const purchases = await PurchasedCourse.find({ course: courseId });
    const totalRevenue = purchases.reduce((sum, purchase) => sum + purchase.price, 0);
    const totalPurchases = purchases.length;
    const result = { totalRevenue: totalRevenue, totalPurchases: totalPurchases }
    if (totalRevenue && totalPurchases) {
        return res.status(200).json({
            status: 'success',
            result: result
        });
    } else {
        return res.status(400).json({
            status: 'error',
            message: "this Course made no Revenue"
        });
    }
});

const getAllCoursesRevenue = asyncHandler(async (req, res) => {
    const purchases = await PurchasedCourse.find();
    const totalRevenue = purchases.reduce((sum, purchase) => sum + purchase.price, 0);
    const totalPurchases = purchases.length;
    const result = { totalRevenue: totalRevenue, totalPurchases: totalPurchases }
    if (totalRevenue && totalPurchases) {
        return res.status(200).json({
            status: 'success',
            result: result
        });
    } else {
        return res.status(400).json({
            status: 'error',
            message: "no Revenue found"
        });
    }
});

const newCourses = asyncHandler(async (req, res) => {
    const courses = await Course.find().sort({ createdAt: -1 }).limit(6);
    if (courses.length > 0) {
        res.status(200).json({
            status: 'success',
            result: courses
        });
    } else {
        res.status(404).json({
            status: "error",
            message: "no Courses found"
        })
    }
});

const popularCourses = asyncHandler(async (req, res) => {
    const courses = await Course.find().sort({ rate: -1 }).limit(6);
    if (courses.length > 0) {
        res.status(200).json({
            status: 'success',
            result: courses
        });
    } else {
        res.status(404).json({
            status: "error",
            message: "no Courses found"
        })
    }
});

module.exports = {
    getAllCourses,
    getAllPurchasedCourses,
    getCourseById,
    createCourse,
    updateCourse,
    deleteCourse,
    deleteAllCourses,
    showOrHideCourse,
    searchCourse,
    getCourseRevenue,
    getAllCoursesRevenue,
    newCourses,
    popularCourses
}
