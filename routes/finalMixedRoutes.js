const express = require("express");
const router = express.Router();
const {
  createfinalMix,
  getAllfinalMixes,
  getfinalMixById,
  updatefinalMix,
  deletefinalMix
} = require("../services/finalMixedServices");

router.post("/create", createfinalMix);

router.get("/all", getAllfinalMixes);

router.get("/:id", getfinalMixById);

router.put("/:id", updatefinalMix);

router.delete("/:id", deletefinalMix);

module.exports = router;
