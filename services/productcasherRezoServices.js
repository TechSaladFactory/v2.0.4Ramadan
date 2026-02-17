const { productRezoModel } = require("../models/productcasherRezoModel");
const asyncHandler = require("express-async-handler");
const ApiErrors = require("../utils/apiErrors");

// Add product
exports.addProduct = asyncHandler(async (req, res, next) => {
   const { name, price } = req.body;

   // Validate input fields
   if (name === undefined) {
      return next(new ApiErrors(`Name is required!`, 404));
   } else if (name === "") {
      return next(new ApiErrors(`Name must not be empty!`, 404));
   } else if (price === undefined) {
      return next(new ApiErrors(`Price is required!`, 404));
   } else if (price === "" || isNaN(price)) {
      return next(new ApiErrors(`Price must be a valid number!`, 404));
   } else if (price <= 0) {
      return next(new ApiErrors(`Price must be > 0`, 404));
   }

   // Create the new product and rely on the default error handling
   await productRezoModel.create({ name, price });

   res.status(200).json({
      message: "Product is added!"
   });
});

// Get all products
exports.getAllRezoProduct = asyncHandler(async (req, res, next) => {
   const productRez = await productRezoModel.find({});
   res.status(200).json({
      data: productRez
   });
});

// Update product
exports.updateRezoProductById = asyncHandler(async (req, res, next) => {
   const { id } = req.params;
   const { name, price } = req.body;

   const dataUpdated = await productRezoModel.findByIdAndUpdate(
      { _id: id },
      { name, price },
      { new: true }
   );

   if (!dataUpdated) {
      return next(new ApiErrors(`Id ${id} of this product doesn't exist!`, 404));
   }

   res.status(200).json({
      data: dataUpdated
   });
});

// Delete product
exports.deleteProductRez = asyncHandler(async (req, res, next) => {
   const { id } = req.params;

   const productData = await productRezoModel.findById(id);
   if (!productData) {
      return next(new ApiErrors(`Id ${id} of this product doesn't exist!`, 404));
   }

   const dataDeleted = await productRezoModel.findByIdAndDelete(id);
   res.status(200).json({
      data: dataDeleted,
      message: "Product deleted successfully"
   });
});
