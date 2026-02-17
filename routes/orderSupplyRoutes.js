const express = require("express");
const router = express.Router();

const {
  getAllorderSupply,
  getorderSupplyById,
  createorderSupply,
  updateorderSupply,
  deleteorderSupply,
  Issended,
getOrderSof2Days  
} = require("../services/orderSupplyServices");

const {
  createorderSupplyModelValidator,
  getorderSupplyModelByIdValidator,
  updateorderSupplyModelValidator,
  deleteorderSupplyModelValidator
} = require("../validators/orderSupplyValidators");

// Get all
router.route("/getAll").get( getAllorderSupply);
router.route("/isSended/:id").put(Issended)
router.route("/getOrderSof2Days").get( getOrderSof2Days);
// Create new
router.post("/add", createorderSupply);

// Get specific by ID
router.route("/:id").get(getorderSupplyModelByIdValidator, getorderSupplyById)
.put( updateorderSupplyModelValidator, updateorderSupply)
.delete(deleteorderSupplyModelValidator, deleteorderSupply);

module.exports = router;
