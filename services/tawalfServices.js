const asyncHandler = require("express-async-handler");
const { TawalfModel } = require("../models/tawalfModel");
const ApiErrors = require("../utils/apiErrors");
const multer = require("multer");
const { uploadImage } = require("../utils/imageUploadedtoCloudinary")
const jwt = require("jsonwebtoken");

//create
exports.createTawalf = asyncHandler(async (req, res, next) => {
    const { product, qty, unite,branch } = req.body;
  
    if (!req.headers.authorization) {
      return next(new ApiErrors("Headers does not have token!", 401));
    }
  
    const token = req.headers.authorization.split(" ")[1];
    if (!token) {
      return next(new ApiErrors("Token missing in authorization header", 401));
    }
  
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    } catch (err) {
      return next(new ApiErrors("Invalid or expired token!", 401));
    }
  
    if (!product || !qty) {
      return next(new ApiErrors("Missing required fields: product or qty", 400));
    }
  
    const imageUrl = await uploadImage(req, "Tawalf", next);
  
    const newTawalf = await TawalfModel.create({
      product,
      qty,
      unite,
      image: imageUrl,
      userId: decoded.id,
      branch:branch
    });
  
    res.status(200).json({
      success: true,
      message: "Tawalf created successfully",
      data: newTawalf,
    });
  });
  //get tawalf
exports.getAllTawalf = asyncHandler(async (req, res, next) => {
  const tawalfs = await TawalfModel.find({})
     .populate([
  {
    path: "product",
    select: "name packSize packageUnit mainProductOP",
    populate: [
      { path: "packageUnit", select: "name" },
      { path: "mainProductOP", select: "name order" }
    ]
  },
  { path: "branch", select: "name" }
]).populate({
      path:"unite",
      select:"name"
    }).populate({
      path: "userId",
      select: "name", // هنا بنحدد نجيب بس الاسم
    }).populate({
        path:"branch",
        select:"name"
            });

  res.status(200).json({
    success: true,
    count: tawalfs.length,
    data: tawalfs,
  });
});

//get by id tawalf
exports.getTawalfById = asyncHandler(async (req, res, next) => {
  const tawalf = await TawalfModel.findById(req.params.id)
    .populate("product")
    .populate("unite");

  if (!tawalf) {
    return next(new ApiErrors("Tawalf not found", 404));
  }

  res.status(200).json({ success: true, data: tawalf });
});

//update tawalf
exports.updateTawalf = asyncHandler(async (req, res, next) => {
  const updated = await TawalfModel.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );

  if (!updated) {
    return next(new ApiErrors("Tawalf not found", 404));
  }

  res.status(200).json({ success: true, data: updated });
});

//delete tawalf
exports.deleteTawalf = asyncHandler(async (req, res, next) => {
  const deleted = await TawalfModel.findByIdAndDelete(req.params.id);

  if (!deleted) {
    return next(new ApiErrors("Tawalf not found", 404));
  }

  res.status(200).json({ success: true, message: "Tawalf deleted successfully" });
});
