const express = require("express");
const { createSubCategory, getAllSubCategory } = require("../../controllers/subCategoryController");
const router = express.Router();
router.use(express.json());

router.post("/createsubcategory", createSubCategory);
router.get("/allsubcategories", getAllSubCategory);

module.exports = router;
