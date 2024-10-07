const express = require("express");
const router = express.Router();
const {
    signupStudent,
    signupTeacher,
    signupAdmin,
    loginUser,
    loginAdmin,
    generateOtp,
    forgetPassword,
    getAllUsersByRole,
    blockUserById,
    deleteUserById,
    deleteUserToken,
    lastMounthStudents,
    lastYearStudents
} = require("../controllers/authCont");
const { authentication, admin } = require("../middlewares/authentication")

router.post("/signup", signupStudent);
router.post("/login", loginUser);
router.post("/generate-otp", generateOtp);
router.post("/forget-password", forgetPassword);
router.post("/login-admin", loginAdmin);

// router.use(authentication);
// router.use(admin);
router.route("/signup-teacher")
    .post(signupTeacher);
router.route("/signup-admin")
    .post(signupAdmin);
router.route("/get-all-users")
    .get(getAllUsersByRole);
router.route("/block-user/:id")
    .put(blockUserById)
router.route("/delete-user/:id")
    .delete(deleteUserById)
router.route("/delete-user-token/:id")
    .delete(deleteUserToken)
router.route("/last-mounth-students")
    .get(lastMounthStudents);
router.route("/last-year-students")
    .get(lastYearStudents);
module.exports = router;
