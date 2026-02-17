const express = require("express");
const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const router = express.Router();
const {
    createTawalf,
  getAllTawalf,
  getTawalfById,
  updateTawalf,
  deleteTawalf,
} = require("../services/tawalfServices");

router.post("/create", upload.single("image"), createTawalf); // اسم الحقل 'image' مهم
router.get("/getAll", getAllTawalf);
router.get("/:id", getTawalfById);
router.put("/:id", updateTawalf);
router.delete("/:id", deleteTawalf);

module.exports = router;
