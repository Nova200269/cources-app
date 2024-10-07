const jwt = require("jsonwebtoken");
const { User } = require("../models/User");

const admin = (req, res, next) => {
    if (req.user?.role === "admin") return next();
    return next(new Error("Access denied", 403));
};

const teacher = (req, res, next) => {
    if (req.user?.role === "teacher") return next();
    return next(new Error("Access denied", 403));
};

const authentication = async (req, res, next) => {
    try {
        let token = "";
        if (req.query.token) token = req.query.token;
        else token = req.headers.authorization?.split(" ")[1] || req.headers.authorization;

        if (!token) return next(new Error("Invalid token", 401));
        let user = jwt.verify(token, process.env.JWT_SECRET);
        user = await User.findById(user._id);
        if (user) {
            req.user = user;
            return next();
        }
        return next(new Error("Invalid token", 401));
    } catch (e) {
        return next(new Error("Invalid token", 401));
    }
};

module.exports = {
    admin,
    teacher,
    authentication
}