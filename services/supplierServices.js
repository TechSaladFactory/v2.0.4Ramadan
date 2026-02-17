const { default: slugify } = require("slugify");
const { SupplierModel } = require("../models/supplierModel");
const asyncHandler = require("express-async-handler");
const ApiErrors = require("../utils/apiErrors");
const searchByname=require("../utils/searchBykeyword")
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');

//Get All Suppliers
//roure >> Get Method
// /api/Supplier/getAll
exports.getSuppliers = asyncHandler(async (req, res) => {

  const filter = searchByname(req.query)

  const allSuppliers = await SupplierModel.find(filter);
  res.status(200).json({
    data: allSuppliers,
    itemsnumber: allSuppliers.length,
    status: 200,
  });
 
});
//Get Special Supplier By id
//roure >> Get Method
// /api/categories/id
exports.getSpecialSupplierByid = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const SupplierByid = await SupplierModel.findById({ _id: id });

  if (!SupplierByid) {
    return next(new ApiErrors(`No Supplier found for this SupplierID: ${id} !`, 404));
  }

  res.status(200).json({ data: SupplierByid, status: 200 });
});
//create new Supplier
//roure >> Post Method
// /api/Supplier/addSupplier
exports.addSuppliers = asyncHandler(async (req, res, next) => {
  const { name } = req.body;
  console.log(name);

  if (name === undefined) {
    return next(new ApiErrors(`name are required!`, 404));
  } else if (name === "") {
    return next(new ApiErrors(`name  must not be empty!`, 404));
  } else {
    // Check if Supplier already exists
    const existingSupplier = await SupplierModel.findOne({ name: name });
    if (existingSupplier) {
      return next(new ApiErrors(`Supplier with this name already exists!`, 400));
    }


      console.log(name);
      const Supplierresponse = await SupplierModel.create({
        name,
        slug: slugify(name),
      });

      return res.status(200).json({
        data: Supplierresponse,
        message: "Supplier is added successfully!",
        status: 200,
      });
   
  }
});

//Update to Special Supplier
//roure >> Update Method
// /api/categories/id
exports.updateSupplierByID = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { name } = req.body;


  const SupplierAfterUpdated = await SupplierModel.findOneAndUpdate(
    { _id: id },
    { name, slug: slugify(name) },
    { new: true }
  );
  
  if (name === undefined || name === "") {
    return next(new ApiErrors("Supplier name required !", 404));
  } else {
    if (!SupplierAfterUpdated) {
      return next(new ApiErrors(`No Supplier found for this SupplierID: ${id} !`, 404));
    }

    res.status(200).json({
      message: "Supplier is updated successfully !",
      status: 200,
      data: SupplierAfterUpdated,
    });
  }
});

//Delete Supplier
//roure >> Delete Method
// /api/categories/id

exports.deleteSupplierByID = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const deletedSupplier = await SupplierModel.findOneAndDelete({ _id: id });

  if (id === undefined) {
    return next(new ApiErrors("set Supplier ID !", 404));
  } else {
    if (!deletedSupplier) {
      return next(new ApiErrors(`No Supplier found for this SupplierID: ${id} !`, 404));
    }

    res.status(200).json({ 
      message: "Supplier is deleted successfully !",
      status: 200,
      data: deletedSupplier });
  }
});
