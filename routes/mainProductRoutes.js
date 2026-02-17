const express = require("express");
const multer = require("multer");
const { protect, allwoedTo } = require("../services/authServices");
const {
  getmainProduct,
  getSpecialmainProductByid,
  addmainProduct,
  updatemainProductByID,
  deletemainProductByID,
} = require("../services/mainProductServices");
//validator imports
const {
  getSpecialmainProductByidValidators,
  updatemainProductByIDValidators,
  deletemainProductByIDValidators, addmainProductValidators
} = require("../validators/mainProductValidators");
const router = express.Router();

//mainProductRoute
router
  .route("/addmainProduct")
  .post(
    addmainProductValidators,
    addmainProduct
  );
router.route("/getAll").get(getmainProduct);
router
  .route("/:id")
  .get(getSpecialmainProductByidValidators,getSpecialmainProductByid )
  .put(
    updatemainProductByIDValidators,
    updatemainProductByID
  )
  .delete(
    deletemainProductByIDValidators, deletemainProductByID);

module.exports = router;

//
