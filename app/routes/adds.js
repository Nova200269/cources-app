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
router.use(admin);

router.route("/:id")
    .get(getAddById)
    .put(updateAdd)
    .delete(deleteAdd)

router.route("/add")
    .post(createAdd)
    
router.route("/")
    .get(getAllAdds)
    .delete(deleteAllAdds)

module.exports = router