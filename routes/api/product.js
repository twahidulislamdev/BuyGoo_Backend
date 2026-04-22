const express = require("express");
const router = express.Router();
router.use(express.json());
const multer = require("multer");

const {
  createProduct,
  getAllProducts,
  deleteSingleProduct,
  updateProduct,
  deleteAllProducts,
} = require("../../controllers/productController");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname +
        "-" +
        uniqueSuffix +
        "." +
        file.originalname.split(".")[1],
    );
  },
});
const upload = multer({ storage: storage });
router.post("/createproduct", upload.single("image"), createProduct);
router.get("/getallproducts", getAllProducts);
// use patch for updates since frontend now sends patch and also need multer to process file
router.patch("/updateproduct/:id", upload.single("image"), updateProduct);
router.delete("/deletesingleproduct/:id", deleteSingleProduct);
router.delete("/deleteallproducts", deleteAllProducts);

module.exports = router;
