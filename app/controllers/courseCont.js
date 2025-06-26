const asyncHandler = require("express-async-handler")
const { Course, validateCreateCourse, validateUpdateCourse } = require("../models/Course")
const { PurchasedCourse } = require("../models/PurchasedCourses")
const { Language, getTranslation } = require("../models/Translate")

const getAllCourses = asyncHandler(
    async (req, res) => {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const courses = await Course.find()
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
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
            .populate('comments')
            .populate('category');
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
            .populate('comments')
            .populate('category');
        const count = await Course.countDocuments({ _id: { $in: courseIds } });
        if (!courses || courses.length === 0) {
            return res.status(404).json({
                status: 'error',
                message: 'Courses not found',
            });
        }

        const result = courses.map(course => {
            let completedQuizzes = 0;
            let totalQuizzes = 0;

            course.units.forEach(unit => {
                unit.lectures.forEach(lecture => {
                    if (lecture.quiz) {
                        totalQuizzes++;
                        if (lecture.quiz.isComplete === true) {
                            completedQuizzes++;
                        }
                    }
                });
            });

            return {
                name: getTranslation(course.name, userLang),
                description: getTranslation(course.description, userLang),
                teacherName: getTranslation(course.teacher?.name, userLang),
                image: course.image,
                hours: course.hours,
                price: course.price,
                units: course.units,
                quizzes: course.quizzes,
                introVideo: course.introVideo,
                completedQuizzes,
                totalQuizzes
            };
        });

        return res.status(200).json({
            status: 'success',
            count,
            result,
        });
    }
);

const getCourseById = asyncHandler(
    async (req, res) => {
        const userId = req.user._id;
        let userLang = req.query.lang || 'en';
        const islang = await Language.find({ code: userLang })
        if (!islang) userLang = 'en'
        const courseId = req.params.id
        const hasPurchased = await PurchasedCourse.findOne({ userId, courseId });

        const course = await Course.findById(courseId)
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
            .populate('comments')
            .populate('category');

        if (course) {
            const courseObj = course.toObject();

            let numberOfLectures = 0;
            if (Array.isArray(courseObj.units)) {
                courseObj.units = courseObj.units.map(unit => {
                    if (Array.isArray(unit.lectures)) {
                        numberOfLectures += unit.lectures.length;
                    }
                    return {
                        ...unit,
                        duration: 15
                    };
                });
            }

            const numberOfComments = Array.isArray(courseObj.comments) ? courseObj.comments.length : 0;

            const getTimeAgo = (createdAt) => {
                const now = new Date();
                const diff = now - new Date(createdAt);

                const seconds = Math.floor(diff / 1000);
                const minutes = Math.floor(diff / 60);
                const hours = Math.floor(diff / (60 * 60));
                const days = Math.floor(diff / (1000 * 60 * 60 * 24));
                const months = Math.floor(days / 30);
                const years = Math.floor(months / 12);

                if (years > 0) return `${years} year${years > 1 ? 's' : ''} ago`;
                if (months > 0) return `${months} month${months > 1 ? 's' : ''} ago`;
                if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
                if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
                if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
                return `${seconds} second${seconds !== 1 ? 's' : ''} ago`;
            };

            if (Array.isArray(courseObj.comments)) {
                courseObj.comments = courseObj.comments.map(comment => ({
                    ...comment,
                    writtenAt: getTimeAgo(comment.createdAt)
                }));
            }

            const purchasedCourse = Boolean(hasPurchased);

            res.status(200).json({
                status: 'success',
                result: {
                    ...courseObj,
                    students: 156213,
                    language: 'English',
                    level: 'Beginner',
                    numberOfLectures,
                    numberOfComments,
                    purchasedCourse
                }
            });
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
        const { name, description } = req.body;
        const translations = [name, description];
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
            teacher: req.body.teacher,
            hours: req.body.hours,
            price: req.body.price,
            rate: req.body.rate,
            units: req.body.units,
            final: req.body.final,
            introVideo: req.body.introVideo,
            comments: req.body.comments,
            category: req.body.category,
            discount: req.body.discount,
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
                teacher: req.body.teacher,
                hours: req.body.hours,
                price: req.body.price,
                rate: req.body.rate,
                units: req.body.units,
                final: req.body.final,
                introVideo: req.body.introVideo,
                comments: req.body.comments,
                category: req.body.category,
                discount: req.body.discount,
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
        const course = await Course.findByIdAndDelete(req.params.id)
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
        const hide = req.query.hide === 'true';
        const text = hide ? "hidden" : "visible";
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
    const { name, categoryId, price, rate } = req.query;

    if (!name && !categoryId && !price && !rate) {
        return res.status(400).json({
            status: 'error',
            message: 'At least one search filter (name, categoryId, price, rate) is required'
        });
    }

    const filter = {};

    if (name) {
        const regex = new RegExp(name, 'i');
        filter.$or = [
            { 'name.value': { $regex: regex } },
            { 'teacherName.value': { $regex: regex } }
        ];
    }

    if (categoryId) {
        filter.category = categoryId;
    }

    if (price) {
        const priceValue = parseFloat(price);
        if (!isNaN(priceValue)) {
            filter.price = { $lte: priceValue };
        }
    }

    if (rate) {
        const rateValue = parseFloat(rate);
        if (!isNaN(rateValue)) {
            filter.rate = { $gte: rateValue };
        }
    }

    const courses = await Course.find(filter).populate('introVideo');

    if (courses.length > 0) {
        return res.status(200).json({
            status: 'success',
            count: courses.length,
            result: courses
        });
    } else {
        return res.status(404).json({
            status: 'error',
            message: "No course found"
        });
    }
});

const getCourseRevenue = asyncHandler(async (req, res) => {
    if (!req.params.id) return res.status(400).json({
        status: 'error',
        message: "Course id is required"
    });
    const purchases = await PurchasedCourse.find({ courseId: req.params.id });
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
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const courses = await Course.find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select('-units -quizzes -description -hours -hidden -introVideo -comments -category')
        .populate('teacher', 'name image');

    if (courses.length > 0) {
        const modifiedCourses = courses.map(course => {
            const courseObj = course.toObject();
            const discount = courseObj.discount || 0;
            courseObj.priceAfterDiscount = courseObj.price - (courseObj.price * (discount));
            return courseObj;
        });

        res.status(200).json({
            status: 'success',
            result: modifiedCourses
        });
    } else {
        res.status(404).json({
            status: "error",
            message: "no Courses found"
        });
    }
});

const popularCourses = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const courses = await Course.find().sort({ rate: -1 }).skip(skip).limit(limit)
        .select('-units -quizzes -description -hours -hidden -introVideo -comments -category')
        .populate('teacher', 'name image');

    if (courses.length > 0) {
        const modifiedCourses = courses.map(course => {
            const courseObj = course.toObject();
            const discount = courseObj.discount || 0;
            courseObj.priceAfterDiscount = courseObj.price - (courseObj.price * (discount));
            return courseObj;
        });

        res.status(200).json({
            status: 'success',
            result: modifiedCourses
        });
    } else {
        res.status(404).json({
            status: "error",
            message: "no Courses found"
        })
    }
});

const onSaleCourses = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const courses = await Course.find({ discount: { $gt: 0 } })
        .sort({ createdAt: -1 })
        .skip(skip).limit(limit)
        .select('-units -quizzes -description -hours -hidden -introVideo -comments -category')
        .populate('teacher', 'name image');

    if (courses.length > 0) {
        const modifiedCourses = courses.map(course => {
            const courseObj = course.toObject();
            const discount = courseObj.discount || 0;
            courseObj.priceAfterDiscount = courseObj.price - (courseObj.price * (discount));
            return courseObj;
        });

        res.status(200).json({
            status: 'success',
            result: modifiedCourses
        });
    } else {
        res.status(404).json({
            status: "error",
            message: "No discounted courses found"
        });
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
    popularCourses,
    onSaleCourses
}
