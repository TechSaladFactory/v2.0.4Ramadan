const { default: slugify } = require("slugify");
const { BranchModel } = require("../models/branchModel");
const asyncHandler = require("express-async-handler");
const ApiErrors = require("../utils/apiErrors");
const searchByname=require("../utils/searchBykeyword")
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');
const { productOPModel } = require("../models/productOPModel");

//Get All branch
//roure >> Get Method
// /api/branch/getAll
exports.getbranch = asyncHandler(async (req, res) => {
  const filter = searchByname(req.query);

  const allbranch = await BranchModel.find(filter).populate({
    path: "product",
    populate: {
      path: "mainProductOP",
      select: "name", // اجلب فقط الاسم أو أي بيانات تحتاجها
    },
  }).populate({
    path: "product",
    populate: {
      path: "packageUnit",
      select: "name", // اجلب فقط الاسم أو أي بيانات تحتاجها
    },
  }).populate({
    path: "productTawalf",
    populate: {
      path: "mainProductOP",
      select: "name", // اجلب فقط الاسم أو أي بيانات تحتاجها
    },
  });

  res.status(200).json({
    status: 200,
    itemsnumber: allbranch.length,
    data: allbranch,
  });

 
  });
 
//Get Special branch By id
//roure >> Get Method
// /api/categories/id
exports.getSpecialbranchByid = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const branchByid = await BranchModel.findById({ _id: id }).populate({
    path: "product",
    populate: {
      path: "mainProductOP",
      select: "name", // اجلب فقط الاسم أو أي بيانات تحتاجها
    },
  }).populate({
    path: "product",
    populate: {
      path: "packageUnit",
      select: "name", // اجلب فقط الاسم أو أي بيانات تحتاجها
    },
  }).populate({
    path: "productTawalf",
    populate: {
      path: "mainProductOP",
      select: "name", // اجلب فقط الاسم أو أي بيانات تحتاجها
    },
  });

  if (!branchByid) {
    return next(new ApiErrors(`No branch found for this branchID: ${id} !`, 404));
  }

  res.status(200).json({ data: branchByid, status: 200 });
});
//create new branch
//roure >> Post Method
// /api/branch/addbranch
exports.addbranch = asyncHandler(async (req, res, next) => {
  const { name } = req.body;
  console.log(name);

  if (name === undefined) {
    return next(new ApiErrors(`name are required!`, 404));
  } else if (name === "") {
    return next(new ApiErrors(`name  must not be empty!`, 404));
  } else {
    // Check if branch already exists
    const existingbranch = await BranchModel.findOne({ name: name });
    if (existingbranch) {
      return next(new ApiErrors(`branch with this name already exists!`, 400));
    }


      console.log(name);
      const branchresponse = await BranchModel.create({
        name,
        slug: slugify(name),
      });

      return res.status(200).json({
        data: branchresponse,
        message: "branch is added successfully!",
        status: 200,
      });
   
  }
});

//Update to Special branch
//roure >> Update Method
// /api/categories/id
exports.updatebranchByID = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { name, product } = req.body;

  if (!name || name.trim() === "") {
    return next(new ApiErrors("Branch name is required!", 400));
  }

  if (!Array.isArray(product) || product.length === 0) {
    return next(new ApiErrors("At least one product ID is required!", 400));
  }

  // تأكد إن كل الـ product IDs موجودين
  const productsExist = await productOPModel.find({ _id: { $in: product } });
  if (productsExist.length !== product.length) {
    return next(new ApiErrors("Some product IDs are invalid!", 404));
  }

  const branchAfterUpdated = await BranchModel.findByIdAndUpdate(
    id,
    {
      name,
      product: product,
      slug: slugify(name),
    },
    { new: true }
  );

  if (!branchAfterUpdated) {
    return next(new ApiErrors(`No branch found for this ID: ${id}`, 404));
  }

  res.status(200).json({
    message: "Branch updated successfully!",
    status: 200,
    data: branchAfterUpdated,
  });
});

//update tawalf to branch
exports.updateTawalfTobranch = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { productTawalf } = req.body;


  if (!Array.isArray(productTawalf) || productTawalf.length === 0) {
    return next(new ApiErrors("At least one product ID is required!", 400));
  }

  // تأكد إن كل الـ productTawalf IDs موجودين
  const productsExist = await productOPModel.find({ _id: { $in: productTawalf } });
  if (productsExist.length !== productTawalf.length) {
    return next(new ApiErrors("Some product IDs are invalid!", 404));
  }

  const branchAfterUpdated = await BranchModel.findByIdAndUpdate(
    id,
    {
      productTawalf: productTawalf,
    },
    { new: true }
  );

  if (!branchAfterUpdated) {
    return next(new ApiErrors(`No branch found for this ID: ${id}`, 404));
  }

  res.status(200).json({
    message: "Branch updated successfully!",
    status: 200,
    data: branchAfterUpdated,
  });
});


//Delete branch
//roure >> Delete Method
// /api/categories/id

exports.deletebranchByID = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const deletedbranch = await BranchModel.findOneAndDelete({ _id: id });

  if (id === undefined) {
    return next(new ApiErrors("set branch ID !", 404));
  } else {
    if (!deletedbranch) {
      return next(new ApiErrors(`No branch found for this branchID: ${id} !`, 404));
    }

    res.status(200).json({ 
      message: "branch is deleted successfully !",
      status: 200,
      data: deletedbranch });
  }
});


//add product to branch
// PATCH /api/v1/branches/:id/add-products

exports.addProductsToBranch = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { product } = req.body;

  if (!Array.isArray(product) || product.length === 0) {
    return next(new ApiErrors("Please provide an array of product IDs!", 400));
  }

  const existingProducts = await productOPModel.find({ _id: { $in: product } });
  if (existingProducts.length !== product.length) {
    return next(new ApiErrors("Some product IDs are invalid or not found!", 404));
  }

  const updatedBranch = await BranchModel.findByIdAndUpdate(
    id,
    { $addToSet: { product: { $each: product } } }, 
    { new: true }
  );

  if (!updatedBranch) {
    return next(new ApiErrors(`No branch found with ID: ${id}`, 404));
  }

  res.status(200).json({
    message: "Products added to branch successfully!",
    status: 200,
    data: updatedBranch,
  });
});
//add tawalf to branch

exports.addProductsTawalfToBranch = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { productTawalf } = req.body;

  if (!Array.isArray(productTawalf) || productTawalf.length === 0) {
    return next(new ApiErrors("Please provide an array of product IDs!", 400));
  }

  const existingProducts = await productOPModel.find({ _id: { $in: productTawalf } });
  if (existingProducts.length !== productTawalf.length) {
    return next(new ApiErrors("Some product IDs are invalid or not found!", 404));
  }

  const updatedBranch = await BranchModel.findByIdAndUpdate(
    id,
    { $addToSet: { productTawalf: { $each: productTawalf } } }, 
    { new: true }
  );

  if (!updatedBranch) {
    return next(new ApiErrors(`No branch found with ID: ${id}`, 404));
  }

  res.status(200).json({
    message: "Products added to branch successfully!",
    status: 200,
    data: updatedBranch,
  });
});

