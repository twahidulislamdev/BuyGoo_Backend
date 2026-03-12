const express = require("express");
const mongoose = require("mongoose");
const { Schema } = mongoose;

const productSchema = new Schema(
  {
    name: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
    },
    // arrays to store variants selected by the user
    colors: {
      type: [String],
      default: [],
    },
    sizes: {
      type: [String],
      default: [],
    },
    ram: {
      type: String,
      default: "",
    },
    storage: {
      type: String,
      default: "",
    },
    stock: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
    category: {
      type: String,
    },
    image:{
      type: String,
    }
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("ProductList", productSchema);
