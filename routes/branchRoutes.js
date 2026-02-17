const express = require("express");
const multer = require("multer");
const { protect, allwoedTo } = require("../services/authServices");
const {
  getbranch,
  getSpecialbranchByid,
  addbranch,
  updatebranchByID,
  deletebranchByID,
  addProductsToBranch,
  addProductsTawalfToBranch,
  updateTawalfTobranch
} = require("../services/branchServices");
//validator imports
const {
  addbranchValidators,
  getSpecialbranchByidValidators,
  updatebranchByIDValidators,
  deletebranchByIDValidators,
} = require("../validators/branchValidators");
const router = express.Router();

//branchRoute

router.route("/:id/addproducts").post(addProductsToBranch);
router
  .route("/addbranch")
  .post(
    addbranchValidators,
    addbranch
  );
  router.route("/:id/addTawalfProductToBranch").post(addProductsTawalfToBranch)
router.route("/getAll").get(getbranch);
router
  .route("/:id")
  .get(getSpecialbranchByidValidators,getSpecialbranchByid )
  .put(
    updatebranchByIDValidators,
    updatebranchByID
  )
  .delete(
    deletebranchByIDValidators, deletebranchByID);
    router.route("/updateTawalfProductsTobranch/:id").put(updateTawalfTobranch);

module.exports = router;

//
