const express = require("express");
const multer = require("multer");
const { protect, allwoedTo } = require("../services/authServices");
const {
  getSuppliers,
  getSpecialSupplierByid,
  addSuppliers,
  updateSupplierByID,
  deleteSupplierByID,
} = require("../services/supplierServices");
//validator imports
const {
  getSpecialSupplierByidValidators,
  updateSupplierByIDValidators,
  deleteSupplierByIDValidators, addSuppliersValidators
} = require("../validators/supplierValidators");
const router = express.Router();

//SupplierRoute
router
  .route("/addSupplier")
  .post(
    addSuppliersValidators,
    addSuppliers
  );
router.route("/getAll").get(getSuppliers);
router
  .route("/:id")
  .get(getSpecialSupplierByidValidators,getSpecialSupplierByid )
  .put(
    updateSupplierByIDValidators,
    updateSupplierByID
  )
  .delete(
    deleteSupplierByIDValidators, deleteSupplierByID);

module.exports = router;

//
