const express = require("express");
const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage });
const { protect, allwoedTo } = require("../services/authServices");
const {
  deleteproductByID,
  updateproductByID,
  getSpecialproductByid,
  addproduct,
  getproduct,
  minQty,
  productByBarCode,
  downloadProductByIdExcel,
  downloadAllProductsExcel,
  getrelatedMainProduct,
  addqtyAndexpiredByBarcode,
  subtractQuantityByBarcode,
  getrealtedOrderProduction
} = require("../services/productServices");

//validator imports
const {
  addproductValidators,
  getSpecialproductByidValidators,
  updateproductByIDValidators,
  deleteproductByIDValidators,
  UpdateminQtyByIDValidators,
} = require("../validators/productValidators");
const router = express.Router();

//productRoute
router.route("/relatedOrderProduction").get(getrealtedOrderProduction)

router.route("/barcode").post(productByBarCode);
router.route("/download/excel/:id").get(downloadProductByIdExcel);
router.route("/downloadAll").get(downloadAllProductsExcel);
router.route("/:id/relatedMainProduct").get(getrelatedMainProduct)
router.route("/add").post(addproductValidators, addproduct);
router.route("/getAll").get(getproduct);
router
  .route("/:id")
  .get(getSpecialproductByidValidators, getSpecialproductByid)
  .put(updateproductByIDValidators, updateproductByID)
  .delete(deleteproductByIDValidators, deleteproductByID);
router.route("/minQty/:id").put(UpdateminQtyByIDValidators, minQty);
router.route("/addqtyAndexpiredByBarcode").post(addqtyAndexpiredByBarcode)
router.route("/outproduct").post(subtractQuantityByBarcode)
module.exports = router;

//
