const express = require("express")
const router = express.Router()
const {
    getAllQuizzes,
    getQuizById,
    createQuiz,
    updateQuiz,
    deleteQuiz,
    deleteAllQuizzes
} = require("../controllers/quizCont")
const { admin, teacher, authentication } = require("../middlewares/authentication")

router.use(authentication);
router.route("/")
    .get(getAllQuizzes)
router.route("/:id")
    .get(getQuizById)

// router.use(teacher);
router.route("/:id")
    .put(teacher, updateQuiz)
    .delete(teacher, deleteQuiz)
router.route("/add")
    .post(teacher, createQuiz)

// router.use(admin);
router.route("/")
    .delete(admin, deleteAllQuizzes)

module.exports = router