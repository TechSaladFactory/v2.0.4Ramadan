const express = require("express");
const multer = require("multer");
const {
    createLevel,
getAllLevel,
updateLevel,
deleteLevel
} = require("../services/levelServices");

const router = express.Router();
router.route("/create").post(createLevel)
router.route("/getAll").get(getAllLevel);
router.route("/:id").put(updateLevel).delete(deleteLevel)

module.exports = router;
