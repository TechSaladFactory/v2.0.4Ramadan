const express = require("express");
const router = express.Router();

const {
  getAllOrderProductions,
  getOrderProductionById,
  createOrderProduction,
  updateOrderProduction,
  deleteOrderProduction,
  Issended,
  getAllOrderProductionsof2Days
} = require("../services/orderProductionServices");

const {
  createOrderProductionValidator,
  getOrderProductionByIdValidator,
  updateOrderProductionValidator,
  deleteOrderProductionValidator
} = require("../validators/orderProductionValidators");

// Get all
router.get("/getAll", getAllOrderProductions);
router.get("/getOrderPof2Days", getAllOrderProductionsof2Days);

router.route("/isSended/:id").put(Issended)
// Create new
router.post("/add", createOrderProduction);

// Get specific by ID
router.route("/:id").get(getOrderProductionByIdValidator, getOrderProductionById)
.put( updateOrderProductionValidator, updateOrderProduction)
.delete(deleteOrderProductionValidator, deleteOrderProduction);

module.exports = router;
