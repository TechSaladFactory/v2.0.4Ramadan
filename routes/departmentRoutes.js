const express = require("express");
const multer = require("multer");
const { protect, allwoedTo } = require("../services/authServices");
const {
  getdepartments,
  getSpecialdepartmentByid,
  addDepartments,
  updateDepartmentByID,
  deleteDepartmentByID,
} = require("../services/departmentServices");
//validator imports
const {
  addDepartmentsValidators,
  getSpecialDepartmentByidValidators,
  updateDepartmentByIDValidators,
  deleteDepartmentByIDValidators,
} = require("../validators/departmentValidators");
const router = express.Router();

//DepartmentRoute
router
  .route("/addDepartment")
  .post(
    addDepartmentsValidators,
    addDepartments
  );
router.route("/getAll").get(getdepartments);
router
  .route("/:id")
  .get(getSpecialDepartmentByidValidators,getSpecialdepartmentByid )
  .put(
    updateDepartmentByIDValidators,
    updateDepartmentByID
  )
  .delete(
    deleteDepartmentByIDValidators, deleteDepartmentByID);

module.exports = router;

//
