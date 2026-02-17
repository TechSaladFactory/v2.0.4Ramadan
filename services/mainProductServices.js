const { default: slugify } = require("slugify");
const { MainProductModel } = require("../models/mainProductModel");
const asyncHandler = require("express-async-handler");
const ApiErrors = require("../utils/apiErrors");
const searchByname=require("../utils/searchBykeyword")
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');

//Get All mainProduct
//roure >> Get Method
// /api/mainProduct/getAll
exports.getmainProduct= asyncHandler(async (req, res) => {
  //const page = req.query.page * 1 || 1;
  //const limit = req.query.limit * 1 || 4;
  //const skip = (page - 1) * limit;
  const filter = searchByname(req.query)

  const allmainProduct= await MainProductModel.find(filter);
  res.status(200).json({
    data: allmainProduct,
    itemsnumber: allmainProduct.length,
    status: 200,
  });
 
});
//Get Special mainProductBy id
//roure >> Get Method
// /api/mainProducte/id
exports.getSpecialmainProductByid = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const mainProductByid = await MainProductModel.findById({ _id: id });

  if (!mainProductByid) {
    return next(new ApiErrors(`No mainProductfound for this mainProductID: ${id} !`, 404));
  }

  res.status(200).json({ data: mainProductByid, status: 200 });
});
//create new mainProduct
//roure >> Post Method
// /api/mainProduct/addmainProduct
exports.addmainProduct= asyncHandler(async (req, res, next) => {
  const { name } = req.body;
  console.log(name);

  if (name === undefined) {
    return next(new ApiErrors(`name are required!`, 404));
  } else if (name === "") {
    return next(new ApiErrors(`name  must not be empty!`, 404));
  } else {
    // Check if mainProductalready exists
    const existingmainProduct= await MainProductModel.findOne({ name: name });
    if (existingmainProduct) {
      return next(new ApiErrors(`mainProductwith this name already exists!`, 400));
    }


      console.log(name);
      const mainProductresponse = await MainProductModel.create({
        name,
        slug: slugify(name),
      });

      return res.status(200).json({
        data: mainProductresponse,
        message: "mainProductis added successfully!",
        status: 200,
      });
   
  }
});

//Update to Special mainProduct
//roure >> Update Method
// /api/mainProduct/id
exports.updatemainProductByID = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { name } = req.body;


  const mainProductAfterUpdated = await MainProductModel.findOneAndUpdate(
    { _id: id },
    { name, slug: slugify(name) },
    { new: true }
  );
  
  if (name === undefined || name === "") {
    return next(new ApiErrors("mainProductname required !", 404));
  } else {
    if (!mainProductAfterUpdated) {
      return next(new ApiErrors(`No mainProductfound for this mainProductID: ${id} !`, 404));
    }

    res.status(200).json({
      message: "mainProductis updated successfully !",
      status: 200,
      data: mainProductAfterUpdated,
    });
  }
});

//Delete mainProduct
//roure >> Delete Method
// /api/mainProduct/id

exports.deletemainProductByID = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const deletedmainProduct= await MainProductModel.findOneAndDelete({ _id: id });

  if (id === undefined) {
    return next(new ApiErrors("set mainProductID !", 404));
  } else {
    if (!deletedmainProduct) {
      return next(new ApiErrors(`No mainProductfound for this mainProductID: ${id} !`, 404));
    }

    res.status(200).json({ 
      message: "mainProductis deleted successfully !",
      status: 200,
      data: deletedmainProduct});
  }
});
