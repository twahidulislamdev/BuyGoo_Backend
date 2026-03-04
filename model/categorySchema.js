const express = require("express");
const mongoose = require("mongoose");
const { Schema } = mongoose;

const categorySchema = new Schema(
  {
    name: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    slug: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
    },
    subCategories: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "SubCategoryList",
      },
    ],
  },
  { timestamps: true },
);
module.exports = mongoose.model("CategoryList", categorySchema);
