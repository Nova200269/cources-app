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

// router.use(teacher);
router.route("/:id")
    .get(getQuestionById)
    .put(updateQuestion)
    .delete(deleteQuestion)

router.route("/add")
    .post(createQuestion)
    
router.route("/")
    .get(getAllQuestions)
    .delete(deleteAllQuestions)

module.exports = router