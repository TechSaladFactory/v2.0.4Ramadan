const express = require("express");
const router = express.Router();

const {
  getAllSensitivityMix,
  createSensitivityMix,
  updateSensitivityMix,
  deleteSensitivityMix,
} = require("../services/sensitivityMixServices");

router.get("/getall", getAllSensitivityMix);

// CREATE
router.post("/create", createSensitivityMix);

// UPDATE
router.put("/:id", updateSensitivityMix);

// DELETE
router.delete("/:id", deleteSensitivityMix);

module.exports = router;