const express = require("express")
const router = express.Router()
const {
    getAllAdds,
    getAddById,
    createAdd,
    updateAdd,
    deleteAdd,
    deleteAllAdds
} = require("../controllers/addCont")
const { admin, authentication } = require("../middlewares/authentication")

router.use(authentication);
router.route("/")
    .get(getAllAdds)
router.route("/:id")
    .get(getAddById)

router.use(admin);
router.route("/")
    .delete(deleteAllAdds)
router.route("/:id")
    .put(updateAdd)
    .delete(deleteAdd)
router.route("/add")
    .post(createAdd)

module.exports = router