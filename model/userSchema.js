const express = require("express");
const { Admin } = require("mongodb");
const mongoose = require("mongoose");
const { Schema } = mongoose;

const userSchema = new Schema({
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
  status: {
    type: String,
    default: "active",
    enum: ["active", "inactive"],
  },
  role: {
    type: String,
    default: "user",
    enum: ["user", "admin"],
  },
});

module.exports = mongoose.model("userList", userSchema);
