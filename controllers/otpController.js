const emailVerification = require("../helpers/emailVerification");
const userSchema = require("../model/userSchema");
const crypto = require("crypto");

// ====================== firstOtpController Part Start Here =================
const firstOtpController = async (req, res) => {
  const { email, otp } = req.body;
  const user = await userSchema.findOne({ email });
  if (!user) {
    return res.status(400).json({
      message: "User Not Found",
    });
  }
  if (user.isVerified) {
    return res.json({
      message: "User Is Verified",
    });
  }
  if (user.otp !== otp || user.expireOtp < Date.now()) {
    return res.status(400).json({ message: "Invalid OTP" });
  }
  user.isVerified = true;
  user.otp = undefined;
  user.expireOtp = undefined;
  await user.save();
  res.status(200).json({
    message: "Email Verification Done",
  });
};
// ==================== firstOtpController Part End Here =================

//================= ResendOtpController Part Start Here =================
const resendOtpController = async (req, res) => {
  const { email } = req.body;
  const resendOtp = await userSchema.findOne({ email });
  if (!resendOtp) {
    return res.status(400).json({ message: "Error: User Not Found" });
  }

  // Check if user is already verified
  if (resendOtp.isVerified) {
    return res.status(400).json({ message: "Error: Email already verified" });
  }

  // Check if OTP is not expired yet
  if (resendOtp.expireOtp && resendOtp.expireOtp > Date.now()) {
    return res
      .status(400)
      .json({
        message:
          "Error: OTP is still valid. Please wait for it to expire before requesting a new one.",
      });
  }

  // Only send new OTP if user is not verified and OTP is expired
  const otp = crypto.randomInt(100000, 999999).toString();
  const expireOtp = Date.now() + 5 * 60 * 1000; // 5 minutes
  resendOtp.otp = otp;
  resendOtp.expireOtp = expireOtp;
  await resendOtp.save();
  await emailVerification(email, otp, true);
  res.status(200).json({
    message: "OTP Resend Successfully",
  });
};
//=================ResendOtpController Part End Here =================

module.exports = { firstOtpController, resendOtpController };
