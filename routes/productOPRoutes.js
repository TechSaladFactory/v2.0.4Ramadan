const express = require("express");
const {
  deleteproductOPByID,
  updateproductOPByID,
  getSpecialproductOPByid,
  addproductOP,
  getproductOP,
  getrelatedMainproductOP,
  getrealtedOrderproductOPion,
  updateProductIsSupply,
  updateProductIsTawalf
} = require("../services/productOPServices");

// Validators
const {
  addproductOPValidators,
  getSpecialproductOPByidValidators,
  updateproductOPByIDValidators,
  deleteproductOPByIDValidators,
} = require("../validators/productOPValidators");

const router = express.Router();

router.route("/add").post(addproductOPValidators, addproductOP);
router.route("/getAll").get(getproductOP);
router.route("/getProductIsOP").get(getrealtedOrderproductOPion);
router
  .route("/:id")
  .get(getSpecialproductOPByidValidators, getSpecialproductOPByid)
  .put(updateproductOPByIDValidators, updateproductOPByID)
  .delete(deleteproductOPByIDValidators, deleteproductOPByID);
  router.route("/Issupply/:id").put(updateProductIsSupply);
router.route("/IsTawalf/:id").put(updateProductIsTawalf)
router.route("/:id/getrelatedMainproductOP").get(getrelatedMainproductOP)
module.exports = router;
