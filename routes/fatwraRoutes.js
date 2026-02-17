const express = require("express");
const multer = require("multer");
const upload = multer(); // هذا بيقرأ form-data بدون رفع ملف (لو بتستخدم uploadImage داخليًا)

const { protect, allwoedTo } = require("../services/authServices");
const {
  getfatwra,
  getSpecialfatwraByid,
  addfatwra,
  updatefatwraByID,
  deletefatwraByID,
} = require("../services/fatwraServices");
//validator imports
const {
  getSpecialfatwraByidValidators,
  updatefatwraByIDValidators,
  deletefatwraByIDValidators, addfatwraValidators
} = require("../validators/fatwraValidators");
const router = express.Router();

//fatwraRoute
router
  .route("/addfatwra")
  .post(
    upload.single("image"),
    // addfatwraValidators,
    addfatwra
  );
router.route("/getAll").get(getfatwra);
router
  .route("/:id")
  .get(getSpecialfatwraByidValidators,getSpecialfatwraByid )
  .put(
    updatefatwraByIDValidators,
    updatefatwraByID
  )
  .delete(
    deletefatwraByIDValidators, deletefatwraByID);

module.exports = router;

//
