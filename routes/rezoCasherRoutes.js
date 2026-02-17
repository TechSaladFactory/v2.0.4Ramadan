const express = require("express");
const multer = require("multer");

// Multer config (memory storage)
const storage = multer.memoryStorage();
const upload = multer({ storage });

const {
  createRezo,
  getAllRezo,
  getRezoById,
  updateRezo,
  deleteRezo,
  getSalesReport
} = require("../services/rezoCasherServices");

const router = express.Router();

//===========================
// Product Routes
//===========================

// CREATE product (with single image)
router.route("/create").post (upload.single("image"), createRezo);

// GET all products
router.get("/getAll", getAllRezo);
router.get("/getSalesReport", getSalesReport);

// GET single product
router.route("/:id").get(getRezoById)
.put(upload.single("image"), updateRezo).delete( deleteRezo);

module.exports = router;
