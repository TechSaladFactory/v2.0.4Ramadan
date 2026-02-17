const express = require("express");
const router = express.Router();

// Middleware
const { protect, allwoedTo } = require("../services/authServices");

// Controllers
const {
  getmainProductOP,
  getSpecialmainProductOPByid,
  addmainProductOP,
  updatemainProductOPByID,
  deletemainProductOPByID,
  updateProductsOrder
} = require("../services/mainProduct_OPServices");

// Validators
const {
  getSpecialmainProductOPByidValidators,
  updatemainProductOPByIDValidators,
  deletemainProductOPByIDValidators,
  addmainProductOPValidators,
} = require("../validators/mainProductOPValidators");

// Routes

// Add new mainProductOP
router
  .route("/addmainProductOP")
  .post(addmainProductOPValidators, addmainProductOP);
  router
  .route("/updateProductsOrder")
  .put(updateProductsOrder);

// Get all mainProductOP
router
  .route("/getAll")
  .get(getmainProductOP);

// Get, Update, Delete mainProductOP by ID
router
  .route("/:id")
  .get(getSpecialmainProductOPByidValidators, getSpecialmainProductOPByid)
  .put(updatemainProductOPByIDValidators, updatemainProductOPByID)
  .delete(deletemainProductOPByIDValidators, deletemainProductOPByID);

module.exports = router;
