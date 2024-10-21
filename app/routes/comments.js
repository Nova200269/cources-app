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

router.use(admin);

router.route("/:id")
    .get(getCommentById)
    .put(updateComment)
    .delete(deleteComment)
    
router.route("/")
    .get(getAllComments)
    .delete(deleteAllComments)

module.exports = router