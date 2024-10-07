const express = require("express")
const router = express.Router()
const {
    getAllComments,
    getCommentById,
    createComment,
    updateComment,
    deleteComment,
    deleteAllComments
} = require("../controllers/commentCont")
const { admin, authentication } = require("../middlewares/authentication")

router.use(authentication);
router.route("/add")
    .post(createComment)
router.route("/:id")
    .put(updateComment)
    .delete(deleteComment)

router.use(admin);
router.route("/")
    .delete(deleteAllComments)
router.route("/")
    .get(getAllComments)
router.route("/:id")
    .get(getCommentById)

module.exports = router