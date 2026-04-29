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
const userSchema = require("../../model/userSchema");

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
router.get("/getme", async (req, res) => {
  if (!req.session.userSchema || !req.session.userSchema.email) {
    return res.status(401).json({ message: "Unauthorized Person" });
  }
  const findUser = await userSchema.findOne({
    email: req.session.userSchema.email,
  });
  res.send(findUser);
});

// router.get("/login", (req, res) => {
//   res.send("Data Ache");
// });

module.exports = router;
