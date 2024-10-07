const express = require("express")
const router = express.Router()
const {
    getAllQuestions,
    getQuestionById,
    createQuestion,
    updateQuestion,
    deleteQuestion,
    deleteAllQuestions
} = require("../controllers/questionCont")
const { admin, teacher, authentication } = require("../middlewares/authentication")

router.use(authentication);
router.use(admin);

router.route("/")
    .get(getAllQuestions)
router.route("/:id")
    .get(getQuestionById)

// router.use(teacher);
router.route("/:id")
    .put(teacher, updateQuestion)
    .delete(teacher, deleteQuestion)
router.route("/add")
    .post(teacher, createQuestion)

router.route("/")
    .delete(admin, deleteAllQuestions)

module.exports = router