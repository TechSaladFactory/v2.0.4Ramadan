const { DeliveryAppModel } = require("../models/deliveryAppModel");
const asyncHandler = require("express-async-handler");
const ApiErrors = require("../utils/apiErrors");
const slugify = require("slugify");


// ================================
// Get All Delivery Apps
// GET  /api/deliveryApp/getAll
// ================================
exports.getAllDeliveryApps = asyncHandler(async (req, res) => {
  const deliveryApps = await DeliveryAppModel.find();

  res.status(200).json({
    status: 200,
    itemsNumber: deliveryApps.length,
    data: deliveryApps,
  });
});


// ================================
// Get Delivery App By ID
// GET  /api/deliveryApp/:id
// ================================
exports.getDeliveryAppById = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const deliveryApp = await DeliveryAppModel.findById(id);

  if (!deliveryApp) {
    return next(new ApiErrors(`No Delivery App found for ID: ${id}`, 404));
  }

  res.status(200).json({
    status: 200,
    data: deliveryApp,
  });
});


// ================================
// Create New Delivery App
// POST  /api/deliveryApp/add
// ================================
exports.addDeliveryApp = asyncHandler(async (req, res, next) => {
  const { name } = req.body;

  if (!name || name.trim() === "") {
    return next(new ApiErrors("Name is required!", 400));
  }

  // check duplicate
  const exist = await DeliveryAppModel.findOne({ name });
  if (exist) {
    return next(new ApiErrors(`Delivery App with name "${name}" already exists!`, 400));
  }

  const newApp = await DeliveryAppModel.create({
    name,
    slug: slugify(name),
  });

  res.status(200).json({
    status: 200,
    message: "Delivery App created successfully!",
    data: newApp,
  });
});


// ================================
// Update Delivery App
// PUT  /api/deliveryApp/:id
// ================================
exports.updateDeliveryApp = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { name } = req.body;

  if (!name || name.trim() === "") {
    return next(new ApiErrors("Name is required!", 400));
  }

  const updatedApp = await DeliveryAppModel.findByIdAndUpdate(
    id,
    { name, slug: slugify(name) },
    { new: true }
  );

  if (!updatedApp) {
    return next(new ApiErrors(`No Delivery App found for ID: ${id}`, 404));
  }

  res.status(200).json({
    status: 200,
    message: "Delivery App updated successfully!",
    data: updatedApp,
  });
});


// ================================
// Delete Delivery App
// DELETE  /api/deliveryApp/:id
// ================================
exports.deleteDeliveryApp = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const deletedApp = await DeliveryAppModel.findByIdAndDelete(id);

  if (!deletedApp) {
    return next(new ApiErrors(`No Delivery App found for ID: ${id}`, 404));
  }

  res.status(200).json({
    status: 200,
    message: "Delivery App deleted successfully!",
    data: deletedApp,
  });
});
