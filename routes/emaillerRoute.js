const express = require("express");
const multer = require('multer');

const {
    createEmailler,
    updateEmailler,
    getEmailler
} = require("../services/emaillerServices");
//validator imports

const router = express.Router();

router.route("/create").post( createEmailler);
router.route("/:id").put(updateEmailler).get(getEmailler);

module.exports = router;

//
