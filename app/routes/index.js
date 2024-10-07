const auths = require("../routes/auths")
const adds = require("../routes/adds")
const categories = require("../routes/categories")
const courses = require("../routes/courses")
const purchasedCourses = require("../routes/purchasedCourses")
const lectures = require("../routes/lectures")
const comments = require("../routes/comments")
const questions = require("../routes/questions")
const quizzes = require("../routes/quizzes")
const units = require("../routes/units")
const courseProgresses = require("../routes/courseProgresses")
const { notFound, errorHandler } = require("../middlewares/errors")

const registerRoutes = (app) => {
  app.use("/auth", auths);
  app.use("/add", adds);
  app.use("/category", categories);
  app.use("/course", courses);
  app.use("/purchased-course", purchasedCourses);
  app.use("/lecture", lectures);
  app.use("/comment", comments);
  app.use("/question", questions);
  app.use("/quiz", quizzes);
  app.use("/unit", units);
  app.use("/course-progress", courseProgresses);
  app.use(notFound);
  app.use(errorHandler);
};

module.exports = registerRoutes;