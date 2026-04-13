# Authentication System Setup Guide(Project Setup)

### 1. Install Dependencies

```bash
npm install express mongoose mongodb dotenv
```

-Then Create a `index.js` file in the Root and add this code........

require("node:dns/promises").setServers(["1.1.1.1", "8.8.8.8"]);
const express = require("express");
const app = express();
const port = 3000;
require("dotenv").config();
const dbConnection = require("./database/dbConnection");
const route = require("./route");
const session = require("express-session");
const path = require("path");
const cors = require("cors");
app.use(cors());

app.get("/", (req, res) => {
res.send("Hello World!");
});
// Middleware for parsing JSON and URL-encoded data
app.use("/uploads", express.static(path.join(\_\_dirname, "uploads")));

// Use This for session management Start
app.use(
session({
secret: "enmoon123",
resave: false,
saveUninitialized: true,
cookie: { secure: false },
}),
);
// Use this for session management End

// Database Connection
dbConnection();

// Routing Start
app.use("/user", route);
// Routing End

app.listen(port, () => {
console.log(`Example app listening on port ${port}`);
});

### 2. Database Connection

- Install and configure MongoDB also crate databse folder

  **Folder:** `database/`

- Create database connection file in this folder: `dbConnection.js`

const mongoose = require("mongoose");
const dbConnection = async () => {
mongoose
.connect(`${process.env.DB_URL}`)
.then(() => console.log("Database Connected!"));
};
module.exports = dbConnection;`

## 4. Route Structure

-First of all make a router folder `routes/`

-Then Create `index.js` file and add this code
const express = require("express");
const router = express.Router();
const apiRoute = require("./api");

router.use("/v1", apiRoute);

module.exports = router;

-Then Create `api` folder.
-Then create `auth.js` file where you can do authentication related work. Like...

const express = require("express");
const router = express.Router();
const {
signupController,
loginController,
logoutController,
dashboardController,
} = require("../../controllers/authController");

const {
firstOtpController,
resendOtpController,
} = require("../../controllers/otpController");
const authMiddleware = require("../../middleware/authMiddleware");

router.post("/signup", signupController);
router.post("/login", loginController);
router.post("/logout", logoutController);
router.post("/otpverify", firstOtpController);
router.post("/resendotp", resendOtpController);
router.get("/dashboard", authMiddleware, dashboardController);

// router.get("/login", (req, res) => {
// res.send("Data Ache");
// });

module.exports = router;

### 5. Controllers Setup process

First of all Create a `controllers/` folder in root.
Then Create working related file like: - `authController.js`

const express = require("express");
const router = express.Router();
const userSchema = require("../model/userSchema");
/_ ======================= SIGNUP CONTROLLER Start ======================= _/
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
// Duplicate Email Check Start
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
// return res.json({
// message: "Error: This Email Already Exists",
// });
// }
// Duplicate Email Check End

// ------------Use crypto for send OTP Start-------------

// First way using function Start
// function generateOTP() {
// const otp = crypto.randomInt(100000, 999999).toString();
// const expiresOTP = new Date(Date.now() + 10 _ 60 _ 1000);
// return { otp, expiresOTP };
// }
// const { otp, expiresOTP } = generateOTP();
// console.log("Generated OTP:", otp, "Expires at:", expiresOTP);
// First way using function End

// Second way without using function Start
// const otp = Math.floor(100000 + Math.random() \* 900000);

const otp = crypto.randomInt(100000, 999999).toString();
const expiresOtp = new Date(Date.now() + 5 _ 60 _ 1000);
// console.log("Generated OTP:", otp, "Expires at:", expiresOtp);

// Second way without using function End
// ---------------Use crypto for send OTP End----------------

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
messege: "Data Send",
});
});
};
/_ ======================= SIGNUP CONTROLLER End ======================= _/

### 6.Create Models Folder `models/`

Then Create `authSchems.js` file

const express = require("express");
const { Admin } = require("mongodb");
const mongoose = require("mongoose");
const { Schema } = mongoose;

const authSchema = new Schema({
firstName: {
type: String,
required: true,
},
lastName: {
type: String,
required: true,
},
email: {
type: String,
required: true,
},
password: {
type: String,
required: true,
},
otp: {
type: String,
},
expireOtp: {
type: Date,
},
isVerified: {
type: Boolean,
default: false,
},
role: {
type: String,
default: "user",
enum: ["user", "admin"],
},
});

module.exports = mongoose.model("userList", authSchema);

### 7. Email Validation Helper

Create **Folder:** `helpers/`

- **File**: `helpers/emailValidation.js`
  const emailValidation = (email) => {
  const emailReg =
  /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)\*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

  return emailReg.test(email);
  };

module.exports = emailValidation;

- **File**: `helpers/emailVerification.js`
  const nodemailer = require("nodemailer");

const emailVerification = async (email, otp, isResend = false) => {
const transporter = nodemailer.createTransport({
service: "gmail",
port: 587,
secure: false,
auth: {
user: process.env.EMAIL_USER,
pass: process.env.EMAIL_PASS,
},
});

await transporter.sendMail({
from: '"BuyGoo" <twahidulislam2005@gmail.com>',
to: email,
subject: isResend
? "Your Resend OTP Verification Code"
: "Your OTP Verification Code",
html: `

<div style="max-width:600px;margin:0 auto;font-family:Arial,Helvetica,sans-serif;background:#ffffff;border:1px solid #e5e7eb;border-radius:8px;overflow:hidden">
<div style="background:#f9fafb;padding:20px;text-align:center;border-bottom:1px solid #e5e7eb">
<h1 style="color:#111827;margin:0;font-size:22px">
BuyGoo
</h1>
</div>

        <div style="padding:20px;color:#374151">
          <h2 style="margin-top:0;color:#111827">OTP Verification</h2>

          <p style="font-size:14px">Hello,</p>

          <p style="font-size:14px">
            Use the following One-Time Password (OTP).
            This OTP is valid for <strong>5 minutes</strong>.
          </p>

         <!-- OTP Box -->
        <div style="text-align:center;margin:30px 0">
          <span style="
            display:inline-block;
            padding:15px 30px;
            font-size:28px;
            font-weight:bold;
            letter-spacing:6px;
            color:#111827;
            background:#f9fafb;
            border-radius:6px;
            border:2px solid #e5e7eb;
          ">
            ${otp}
          </span>
        </div>
        <p style="font-size:12px;color: #555;text-align:center;">
         Never share this code with anyone.</p>

          <p style="font-size:14px;color:#6b7280;background:#f9fafb;padding:12px;border-radius:4px;text-align:center">
            If you did not request this code, please ignore this email.
          </p>

          <p style="font-size:14px;margin-top:30px">
            Regards,<br />
            <strong>BuyGoo Team</strong>
          </p>
        </div>

        <div style="background:#f9fafb;padding:15px;text-align:center;font-size:12px;color:#9ca3af;border-top:1px solid #e5e7eb">
          © ${new Date().getFullYear()} BuyGoo. All rights reserved.
        </div>
      </div>
    `,

});
};

module.exports = emailVerification;

### 8. Database Operations

- In `signupController.js`, send validated data to database

## Security Features

### 10. Password Hashing

```javascript
const bcrypt = require("bcrypt");

// Hash password before saving
const hashedPassword = await bcrypt.hash(password, 10);
// Store hash in your password DB
```

### 11. Duplicate Email Handling

- Use Mongoose/Langkit to prevent duplicate email registration
- Return appropriate error message
- Check if email already exists
- Return proper error message

### 12. Required Password Validation

- Ensure password field is required
- Add password strength requirements (optional)

## 13. OTP Generation

- Use Node.js `crypto`
- Generate OTP for verification

---

### 14. OTP Expiration

```javascript
const expireOtp = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
```

### 15. Email Service (NodeMailer)

- Install nodemailer
- Create controller for sending emails
- Configure email verification helpers

### 16. OTP Verification Controller

- Create `otpController.js` file

const emailVerification = require("../helpers/emailVerification");
const userSchema = require("../model/userSchema");
const crypto = require("crypto");

// ====================== firstOtpController Part Start Here =================
const firstOtpController = async function (req, res) {
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
return res.status(400).json({ message: "Error: OTP is still valid. Please wait for it to expire before requesting a new one." });
}

// Only send new OTP if user is not verified and OTP is expired
const otp = crypto.randomInt(100000, 999999).toString();
const expireOtp = Date.now() + 5 _ 60 _ 1000; // 5 minutes
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

---
