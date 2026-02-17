const { default: slugify } = require("slugify");
const { DepartmentModel } = require("../models/departmentModel");
const asyncHandler = require("express-async-handler");
const ApiErrors = require("../utils/apiErrors");
const searchByname=require("../utils/searchBykeyword")
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');

//Get All departments
//roure >> Get Method
// /api/department/getAll
exports.getdepartments = asyncHandler(async (req, res) => {
  //const page = req.query.page * 1 || 1;
  //const limit = req.query.limit * 1 || 4;
  //const skip = (page - 1) * limit;
  const filter = searchByname(req.query)

  const alldepartments = await DepartmentModel.find(filter);
  res.status(200).json({
    data: alldepartments,
    itemsnumber: alldepartments.length,
    status: 200,
  });
 
});
//Get Special department By id
//roure >> Get Method
// /api/categories/id
exports.getSpecialdepartmentByid = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const DepartmentByid = await DepartmentModel.findById({ _id: id });

  if (!DepartmentByid) {
    return next(new ApiErrors(`No department found for this DepartmentID: ${id} !`, 404));
  }

  res.status(200).json({ data: DepartmentByid, status: 200 });
});
//create new department
//roure >> Post Method
// /api/department/adddepartment
exports.addDepartments = asyncHandler(async (req, res, next) => {
  const { name } = req.body;
  console.log(name);

  if (name === undefined) {
    return next(new ApiErrors(`name are required!`, 404));
  } else if (name === "") {
    return next(new ApiErrors(`name  must not be empty!`, 404));
  } else {
    // Check if Department already exists
    const existingDepartment = await DepartmentModel.findOne({ name: name });
    if (existingDepartment) {
      return next(new ApiErrors(`Department with this name already exists!`, 400));
    }


      console.log(name);
      const Departmentresponse = await DepartmentModel.create({
        name,
        slug: slugify(name),
      });

      return res.status(200).json({
        data: Departmentresponse,
        message: "Department is added successfully!",
        status: 200,
      });
   
  }
});

//Update to Special Department
//roure >> Update Method
// /api/categories/id
exports.updateDepartmentByID = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { name } = req.body;


  const DepartmentAfterUpdated = await DepartmentModel.findOneAndUpdate(
    { _id: id },
    { name, slug: slugify(name) },
    { new: true }
  );
  
  if (name === undefined || name === "") {
    return next(new ApiErrors("Department name required !", 404));
  } else {
    if (!DepartmentAfterUpdated) {
      return next(new ApiErrors(`No Department found for this DepartmentID: ${id} !`, 404));
    }

    res.status(200).json({
      message: "Department is updated successfully !",
      status: 200,
      data: DepartmentAfterUpdated,
    });
  }
});

//Delete Department
//roure >> Delete Method
// /api/categories/id

exports.deleteDepartmentByID = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const deletedDepartment = await DepartmentModel.findOneAndDelete({ _id: id });

  if (id === undefined) {
    return next(new ApiErrors("set Department ID !", 404));
  } else {
    if (!deletedDepartment) {
      return next(new ApiErrors(`No Department found for this DepartmentID: ${id} !`, 404));
    }

    res.status(200).json({ 
      message: "Department is deleted successfully !",
      status: 200,
      data: deletedDepartment });
  }
});
