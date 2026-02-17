const express = require("express");
const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage });
const router = express.Router();
const {
  signUp,
  login,
  forgetPassword,
  checkAccountVerified,
  reconfirmEmail,
  confirmOTPEmail,
  changepassword,
  getuser,
  changepasswordNotsessioned,
  updateuserdataSessioned,
  deleteLoggeduser,
  getuserDepartment,
  getuserBranchOP,
  getuserBranchOS,
  getuserBranchtawalf,
  getuserBranchRezoCaher,sendEmailOTP,verifyEmailOTP,
    addEmail,verifyOTP
} = require("../services/authServices");

const {
  signUpValidators,
  LoginValidators,
  forgetValidators,
  changepasswordValidators,
  getverfyemailValidators,
  getuserValidators,
  changepasswordNotsessionedValidators,
  updateuserdataSessionedValidators,
} = require("../validators/authValidators");

router.route("/login").post(LoginValidators, login);
router.route("/user/department").get(getuserDepartment);

router.route("/user").get(getuserValidators, getuser);

router.route("/add-email").post(addEmail);
router.route("/verify-otp").post(verifyOTP);

// router.route("/signup").post(upload.single("profileImage"), signUpValidators, signUp);
router.route("/user/BranchOP").get( getuserBranchOP);
router.route("/user/BranchOS").get( getuserBranchOS);
router.route("/user/BranchTawalf").get( getuserBranchtawalf);
router.route("/user/BranchRezoCasher").get(getuserBranchRezoCaher)
router.route("/user/send-email-otp").post( sendEmailOTP);
router.route("/user/verify-email-otp").post( verifyEmailOTP);

module.exports = router;
