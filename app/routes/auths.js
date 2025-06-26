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
    lastYearStudents,
    editProfile,
    getTeacherById
} = require("../controllers/authCont");
const { authentication, admin, teacher } = require("../middlewares/authentication")

router.post("/signup", signupStudent);
router.post("/login", loginUser);
router.post("/generate-otp", generateOtp);
router.post("/forget-password", forgetPassword);
router.post("/login-admin", loginAdmin);

router.use(authentication);

router.get('/teacher-by-id/:id', getTeacherById);

router.put('/edit-profile', editProfile);

router.route("/get-all-users")
    .get(getAllUsersByRole);

router.use(admin);

router.route("/signup-teacher")
    .post(signupTeacher);
router.route("/signup-admin")
    .post(signupAdmin);
router.route("/block-user/:id")
    .put(blockUserById)
router.route("/delete-user/:id")
    .delete(deleteUserById)
router.route("/delete-user-token/:id")
    .delete(deleteUserToken)
router.route("/last-mounth-students")
    .get(teacher, lastMounthStudents);
router.route("/last-year-students")
    .get(teacher, lastYearStudents);

module.exports = router;
