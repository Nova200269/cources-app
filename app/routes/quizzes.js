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
router.use(admin);

// router.use(teacher);
router.route("/:id")
    .get(getQuizById)
    .put(updateQuiz)
    .delete(deleteQuiz)
    
router.route("/add")
    .post(createQuiz)

router.route("/")
    .get(getAllQuizzes)
    .delete(deleteAllQuizzes)

module.exports = router