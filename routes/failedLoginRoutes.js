const express = require("express");
const router = express.Router();
const {
  getAllFailedLogins,
  deleteFailedLoginById,
  controlBlockDevices
} = require("../services/failedLoginServices");

// عرض كل السجلات
router.route("/getAllblocked-Devices").get(getAllFailedLogins);

// حذف سجل محدد بـ _id
router.route("/failedlogins/:id").delete( deleteFailedLoginById);
router.route("/controldevice/:id").put(controlBlockDevices)

module.exports = router;
