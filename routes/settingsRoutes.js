const express = require("express");
const router = express.Router();
const {
  createSetting,
  getAllSettings,
  getSettingById,
  updateSetting,
  deleteSetting,
  startCountdown
} = require("../services/settingsServices");

// ✅ Create new setting
router.post("/create", createSetting);

// ✅ Get all settings
router.get("/all", getAllSettings);

// ✅ Get one setting by id
router.get("/:id", getSettingById);

// ✅ Update setting by id
router.put("/:id", updateSetting);
router.put("/start/:id", startCountdown);

// ✅ Delete setting by id
router.delete("/:id", deleteSetting);

module.exports = router;
