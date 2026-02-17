const { default: slugify } = require("slugify");
const { FatworaModel } = require("../models/fatworaModel");
const asyncHandler = require("express-async-handler");
const ApiErrors = require("../utils/apiErrors");
const searchByname=require("../utils/searchBykeyword")
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');
const { UserModel } = require("../models/userModel");
const { uploadImage } = require("../utils/imageUploadedtoCloudinary")
const jwt = require("jsonwebtoken");

//Get All fatwra
//roure >> Get Method
// /api/fatwra/getAll
exports.getfatwra = asyncHandler(async (req, res) => {
  //const page = req.query.page * 1 || 1;
  //const limit = req.query.limit * 1 || 4;
  //const skip = (page - 1) * limit;
  const filter = searchByname(req.query)

  const allfatwra = await FatworaModel.find(filter).populate({ path: "userId", select: "name" });
  res.status(200).json({
    data: allfatwra,
    itemsnumber: allfatwra.length,
    status: 200,
  });
 
});
//Get Special fatwra By id
//roure >> Get Method
// /api/fatwrae/id
exports.getSpecialfatwraByid = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const fatwraByid = await FatworaModel.findById({ _id: id }).populate({ path: "userId", select: "name" });
  ;

  if (!fatwraByid) {
    return next(new ApiErrors(`No fatwra found for this fatwraID: ${id} !`, 404));
  }

  res.status(200).json({ data: fatwraByid, status: 200 });
});
//create new fatwra
//roure >> Post Method
// /api/fatwra/addfatwra
exports.addfatwra = asyncHandler(async (req, res, next) => {
  const { name} = req.body;
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(new ApiErrors(`Header must contain token!`, 404));
  }

  const token = authHeader.split(" ")[1];

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
  } catch (err) {
    return next(new ApiErrors(`Invalid token: ${err.message}`, 401));
  }
  // Check name
  if (!name || name.trim() === "") {
    return next(new ApiErrors("name is required and must not be empty!", 400));
  }


  const existingfatwra = await FatworaModel.findOne({ name: name.trim() });
  if (existingfatwra) {
    return next(new ApiErrors("fatwra with this name already exists!", 400));
  }
  const existinguserid = await UserModel.findOne({ _id: decoded.id });
  if (!existinguserid) {
    return next(new ApiErrors("This user not exists!", 400));
  }

  // Upload and validate image
  const image = await uploadImage(req, "fawateerInventory", next);
  if (!image) {
    return next(new ApiErrors("Image is required!", 400));
  }

  // Create fatwra
  const fatwraresponse = await FatworaModel.create({
    name: name.trim(),
    image,
    userId:decoded.id,
    slug: slugify(name),
  });

  return res.status(201).json({
    data: fatwraresponse,
    message: "fatwra is added successfully!",
    status: 201,
  });
});

//Update to Special fatwra
//roure >> Update Method
// /api/fatwra/id
exports.updatefatwraByID = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { name ,userId } = req.body;


  const fatwraAfterUpdated = await FatworaModel.findOneAndUpdate(
    { _id: id },
    { name, userId,slug: slugify(name) },
    { new: true }
  );
  
  if (name === undefined || name === "") {
    return next(new ApiErrors("fatwra name required !", 404));
  } else {
    if (!fatwraAfterUpdated) {
      return next(new ApiErrors(`No fatwra found for this fatwraID: ${id} !`, 404));
    }

    res.status(200).json({
      message: "fatwra is updated successfully !",
      status: 200,
      data: fatwraAfterUpdated,
    });
  }
});

//Delete fatwra
//roure >> Delete Method
// /api/fatwra/id

exports.deletefatwraByID = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const deletedfatwra = await FatworaModel.findOneAndDelete({ _id: id });

  if (id === undefined) {
    return next(new ApiErrors("set fatwra ID !", 404));
  } else {
    if (!deletedfatwra) {
      return next(new ApiErrors(`No fatwra found for this fatwraID: ${id} !`, 404));
    }

    res.status(200).json({ 
      message: "fatwra is deleted successfully !",
      status: 200,
      data: deletedfatwra });
  }
});
