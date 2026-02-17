const express = require("express");
const {
  getMixproduct,
  addMixproduct,
  updateMixproductByID,
  deleteMixproductByID,
getAllProductWithMixed
  
} = require("../services/mixProductServices");

const router = express.Router();

// ===========================
// Public Routes
// ===========================

// Get all MixProducts
router.get("/getAllMixproduct", getMixproduct);
router.get("/getAllProductWithMixed", getAllProductWithMixed);

// Add new MixProduct
router.post("/create", addMixproduct);

// Update & Delete MixProduct by ID
router
  .route("/:id")
  .put(updateMixproductByID)
  .delete(deleteMixproductByID);

module.exports = router;
