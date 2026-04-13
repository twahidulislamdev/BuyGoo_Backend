const express = require("express");
const {
  createCategory,
  getAllCategory,
  updateCategory,
  deleteCategory,
  deleteAllCategory,
} = require("../../controllers/categoryController");
const router = express.Router();

router.use(express.json());

router.post("/createcategory", createCategory);
router.get("/getallcategory", getAllCategory);
router.put("/updatecategory/:id", updateCategory);
router.delete("/deletecategory/:id", deleteCategory);
router.delete("/deleteallcategory", deleteAllCategory);

module.exports = router;
