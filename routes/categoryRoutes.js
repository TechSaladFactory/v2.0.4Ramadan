const express = require("express");
const multer = require("multer");
const {
addcategory,
updatecategoryByID,
getSpecialcategoryByid,
getcategory,
deletecategoryByID
} = require("../services/categoryServices");


const router = express.Router();


router.route("/add").post(addcategory);

router.route("/getAll").get(getcategory);
router
  .route("/:id")
  .get(getSpecialcategoryByid )
  .put(
    updatecategoryByID )
  .delete(
    deletecategoryByID);

module.exports = router;

//
