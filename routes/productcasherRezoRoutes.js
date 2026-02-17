const express = require("express");
const multer = require("multer");
const {
  addProduct,
  updateRezoProductById,
  deleteProductRez,
  getAllRezoProduct
} = require("../services/productcasherRezoServices");

const router = express.Router();

//productRezoRoute

router.route("/add").post(addProduct);
router.route("/getAll").get(getAllRezoProduct);
router.route("/update/:id").put(updateRezoProductById);
router.route("/delete/:id").delete(deleteProductRez);

module.exports = router;

//
