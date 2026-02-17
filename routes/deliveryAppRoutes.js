const express = require("express");
const router = express.Router();

const {
  getAllDeliveryApps,
  getDeliveryAppById,
  addDeliveryApp,
  updateDeliveryApp,
  deleteDeliveryApp,
} = require("../services/deliveryAppServices");


// ========== ROUTES ==========

// Get all
router.get("/getAll", getAllDeliveryApps);

// Get by ID
router.get("/:id", getDeliveryAppById);

// Add new Delivery App
router.post("/add", addDeliveryApp);

// Update Delivery App
router.put("/:id", updateDeliveryApp);

// Delete Delivery App
router.delete("/:id", deleteDeliveryApp);


module.exports = router;
