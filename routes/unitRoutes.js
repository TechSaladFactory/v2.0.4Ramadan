const express = require("express");
const multer = require("multer");
const { protect, allwoedTo } = require("../services/authServices");
const {
  getunit,
  getSpecialunitByid,
  addunit,
  updateunitByID,
  deleteunitByID,
  addProductsOPToUnit,
  removeProductOPFromUnit
} = require("../services/unitServices");
//validator imports
const {
  getSpecialunitByidValidators,
  updateunitByIDValidators,
  deleteunitByIDValidators, addunitValidators
} = require("../validators/unitValidators");
const router = express.Router();

//unitRoute
router
  .route("/addunit")
  .post(
    addunitValidators,
    addunit
  );
router.route("/getAll").get(getunit);
router
  .route("/:id")
  .get(getSpecialunitByidValidators,getSpecialunitByid )
  .put(
    updateunitByIDValidators,
    updateunitByID
  )
  .delete(
    deleteunitByIDValidators, deleteunitByID);
    //mange P-OPRoutes
router.route("/:unitId/add-productsOP").put(addProductsOPToUnit)
router.route("/:unitId/remove-productsOP").delete(removeProductOPFromUnit)
module.exports = router;

//
