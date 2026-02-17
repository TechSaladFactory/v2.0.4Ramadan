const express = require("express");
const router = express.Router();
const {
  createMix,
  getAllMixes,
  getMixById,
  updateMix,
  deleteMix
} = require("../services/mixedServices");

router.post("/create", createMix);

router.get("/all", getAllMixes);

router.get("/:id", getMixById);

router.put("/:id", updateMix);

router.delete("/:id", deleteMix);

module.exports = router;
