const express = require("express");
const userSchema = require("../model/userSchema");
const router = express.Router();
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const emailValidation = require("../helpers/emailValidation");
const emailVerification = require("../helpers/emailVerification");

/* ======================= SIGNUP CONTROLLER Start ======================= */
const signupController = async (req, res) => {
  const { firstName, lastName, email, password } = req.body;
  if (!firstName) {
    return res.json({
      message: "Error: First Name Required",
    });
  }
  if (!lastName) {
    return res.json({
      message: "Error: Last Name Required",
    });
  }
  if (!email) {
    return res.json({
      message: "Error: Email Required",
    });
  }
  if (!password) {
    return res.json({
      message: "Error: Password Required",
    });
  }
  if (!emailValidation(email)) {
    return res.json({
      message: "Error: Email format is not Correct",
    });
  }
  //  Duplicate Email Check Start
  // -------------First Way--------------
  const duplicateEmail = await userSchema.findOne({ email });
  if (duplicateEmail) {
    return res.json({
      message: "Error: Email Already Exists",
    });
  }
  // -----------------Second Way ------------
  // const duplicateEmail = await userSchema.find({ email });
  // if (duplicateEmail.length > 0) {
  //   return res.json({
  //     message: "Error: This Email Already Exists",
  //   });
  // }
  //  Duplicate Email Check End

  // ------------Use crypto for send OTP Start-------------

  // First way using function Start
  // function generateOTP() {
  //   const otp = crypto.randomInt(100000, 999999).toString();
  //   const expiresOTP = new Date(Date.now() + 10 * 60 * 1000);
  //   return { otp, expiresOTP };
  // }
  // const { otp, expiresOTP } = generateOTP();
  // console.log("Generated OTP:", otp, "Expires at:", expiresOTP);
  // First way using function End

  // Second way without using function Start
  // const otp = Math.floor(100000 + Math.random() * 900000);

  const otp = crypto.randomInt(100000, 999999).toString();
  const expiresOtp = new Date(Date.now() + 5 * 60 * 1000);
  // console.log("Generated OTP:", otp, "Expires at:", expiresOtp);

  // Second way without using function End
  // ---------------Use crypto for send OTP End----------------

  //bcript for hash password
  bcrypt.hash(password, 10, function (err, hash) {
    const users = new userSchema({
      firstName,
      lastName,
      email,
      password: hash,
      // otp: generateOTP(), // First Way Using Function
      otp, // Second Way Without Function
      expireOtp: expiresOtp,
    });
    emailVerification(email, otp);
    users.save();
    res.json({
      messege: "Account Created Successfully. Please Verify Using OTP",
    });
  });
};
/* ======================= SIGNUP CONTROLLER End ======================= */

/* ======================= LOGIN CONTROLLER Start ======================= */
const loginController = async (req, res) => {
  const { email, password } = req.body;
  // Check email
  if (!email) {
    return res.json({ message: "Error: Email Required" });
  }
  // Check password
  if (!password) {
    return res.json({ message: "Error: Password Required" });
  }
  // Validate email format
  if (!emailValidation(email)) {
    return res.json({ message: "Error: Invalid Email Format" });
  }
  // Find user
  const existingUser = await userSchema.findOne({ email });
  if (!existingUser) {
    return res.json({ message: "Error: User Not Found" });
  }
  // Check verification
  if (!existingUser.isVerified) {
    return res.json({ message: "Error: User Not Verified" });
  }
  // Compare password
  const matchPassword = await bcrypt.compare(password, existingUser.password);
  if (!matchPassword) {
    return res.json({ message: "Error: Incorrect Password" });
  }

  // Create session
  req.session.isAuth = true;
  req.session.userSchema = {
    firstName: existingUser.firstName,
    lastName: existingUser.lastName,
    id: existingUser.id,
    email: existingUser.email,
  };
  return res.json({
    message: "Login in Successfully",
    // user: req.session.userSchema,
  });
};
/* ======================= LOGIN CONTROLLER End ======================= */

/* ======================= LOGOUT CONTROLLER Start ======================= */
const logoutController = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.json({ message: "Error: Unable to logout" });
    }

    res.clearCookie("connect.sid");
    return res.json({ message: "Logged out successfully" });
  });
};
/* ======================= LOGOUT CONTROLLER End ======================= */

// ===================== Edit User Controller Start =====================
const EditUserController = async (req, res) => {
  try {
    const { firstName, lastName, email, status } = req.body;

    if (!email) {
      return res.json({ message: "Error: Email Required" });
    }

    const updatedUser = await userSchema.findOneAndUpdate(
      { email },
      { firstName, lastName, status },
      { new: true },
    );
    if (!updatedUser) {
      return res.json({ message: "Error: User Not Found" });
    }
    return res.json({
      message: "User Updated Successfully",
      user: updatedUser,
    });
  } catch (error) {
    return res.json({
      message: "Error updating user",
      error: error.message,
    });
  }
};
// ==================== Edit User Controller End =========================

// ===================== Delete User Controller Start =====================
const DeleteUserController = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.json({ message: "Error: Email Required" });
  }
  const deletedUser = await userSchema.findOneAndDelete({ email });
  if (!deletedUser) {
    return res.json({ message: "Error: User Not Found" });
  }
  return res.json({ message: "User Deleted Successfully" });
};
// ===================== Delete User Controller End =========================

// ===================== Add New User By Admin Controller Start =============
const AddNewUserController = async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    if (!firstName) {
      return res.json({ message: "Error: First Name Required" });
    }
    if (!lastName) {
      return res.json({ message: "Error: Last Name Required" });
    }
    if (!email) {
      return res.json({ message: "Error: Email Required" });
    }
    if (!password) {
      return res.json({ message: "Error: Password Required" });
    }
    if (!emailValidation(email)) {
      return res.json({ message: "Error: Invalid Email Format" });
    }

    // Check for Duplicate Email
    const duplicateEmail = await userSchema.findOne({ email });
    if (duplicateEmail) {
      return res.json({ message: "Error: Email Already Exists" });
    }

    // Hash password
    const hash = await bcrypt.hash(password, 10);

    const newUser = new userSchema({
      firstName,
      lastName,
      email,
      password: hash,
    });

    await newUser.save();
    return res.json({ message: "User Added Successfully" });
  } catch (error) {
    return res.json({
      message: "Error adding user",
      error: error.message,
    });
  }
};
// ===================== Add New User By Admin Controller End ==============

/* ======================= DASHBOARD CONTROLLER Start ======================= */
const dashboardController = (req, res) => {
  if (req.session.isAuth && req.session.userSchema) {
    return res.json({
      message: "Welcome to Dashboard",
      // user: req.session.userSchema,
    });
  }
  return res.json({ message: "Access Denied" });
};
/* ======================= DASHBOARD CONTROLLER End ======================= */

module.exports = {
  signupController,
  loginController,
  logoutController,
  EditUserController,
  DeleteUserController,
  AddNewUserController,
  dashboardController,
};
