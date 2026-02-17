const express = require("express");
const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage });
const { protect, allwoedTo } = require("../services/authServices");
const {
    getAllSendProcess,
    deleteSendProcess
} = require("../services/sendProcesServices");


const router = express.Router();

//productRoute
router.route("/all").get(getAllSendProcess)
router.route("/:id").delete(deleteSendProcess)

module.exports = router;

//
