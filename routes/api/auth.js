const express = require("express");
const router = express.Router();
const {
  signupController,
  loginController,
  logoutController,
  GetAllUserController,
  EditUserController,
  DeleteSingleUserController,
  AddNewUserController,
  DeleteAllUserController,
  DashboardController,
  CurrentUserController,
} = require("../../controllers/authController");

const {
  FirstOtpController,
  ResendOtpController,
} = require("../../controllers/otpController");

const authMiddleware = require("../../middleware/authMiddleware");

router.post("/signup", signupController);
router.post("/login", loginController);
router.post("/logout", logoutController);
router.post("/otpverify", FirstOtpController);
router.post("/resendotp", ResendOtpController);
router.get("/getallusers", GetAllUserController);
router.post("/edituser", EditUserController);
router.post("/deleteuser", DeleteSingleUserController);
router.post("/deleteallusers", DeleteAllUserController);
router.post("/addnewuser", AddNewUserController); // New route for adding user by Admin
router.get("/dashboard", authMiddleware, DashboardController);
router.get("/currentuser", CurrentUserController);

// router.get("/login", (req, res) => {
//   res.send("Data Ache");
// });

module.exports = router;
