const { default: slugify } = require("slugify");
const { UnitModel } = require("../models/unitModel");
const asyncHandler = require("express-async-handler");
const ApiErrors = require("../utils/apiErrors");
const searchByname=require("../utils/searchBykeyword")
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');

//Get All unit
//roure >> Get Method
// /api/unit/getAll
exports.getunit = asyncHandler(async (req, res) => {
  //const page = req.query.page * 1 || 1;
  //const limit = req.query.limit * 1 || 4;
  //const skip = (page - 1) * limit;
  const filter = searchByname(req.query)

  const allunit = await UnitModel.find(filter).populate("Tawalf_productOP");
  res.status(200).json({
    data: allunit,
    itemsnumber: allunit.length,
    status: 200,
  });
 
});
//Get Special unit By id
//roure >> Get Method
// /api/unite/id
exports.getSpecialunitByid = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const unitByid = await UnitModel.findById({ _id: id });

  if (!unitByid) {
    return next(new ApiErrors(`No unit found for this unitID: ${id} !`, 404));
  }

  res.status(200).json({ data: unitByid, status: 200 });
});
//create new unit
//roure >> Post Method
// /api/unit/addunit
exports.addunit = asyncHandler(async (req, res, next) => {
  const { name } = req.body;
  console.log(name);

  if (name === undefined) {
    return next(new ApiErrors(`name are required!`, 404));
  } else if (name === "") {
    return next(new ApiErrors(`name  must not be empty!`, 404));
  } else {
    // Check if unit already exists
    const existingunit = await UnitModel.findOne({ name: name });
    if (existingunit) {
      return next(new ApiErrors(`unit with this name already exists!`, 400));
    }


      console.log(name);
      const unitresponse = await UnitModel.create({
        name,
        slug: slugify(name),
      });

      return res.status(200).json({
        data: unitresponse,
        message: "unit is added successfully!",
        status: 200,
      });
   
  }
});

//Update to Special unit
//roure >> Update Method
// /api/unit/id
exports.updateunitByID = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { name } = req.body;


  const unitAfterUpdated = await UnitModel.findOneAndUpdate(
    { _id: id },
    { name, slug: slugify(name) },
    { new: true }
  );
  
  if (name === undefined || name === "") {
    return next(new ApiErrors("unit name required !", 404));
  } else {
    if (!unitAfterUpdated) {
      return next(new ApiErrors(`No unit found for this unitID: ${id} !`, 404));
    }

    res.status(200).json({
      message: "unit is updated successfully !",
      status: 200,
      data: unitAfterUpdated,
    });
  }
});

//Delete unit
//roure >> Delete Method
// /api/unit/id

exports.deleteunitByID = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const deletedunit = await UnitModel.findOneAndDelete({ _id: id });

  if (id === undefined) {
    return next(new ApiErrors("set unit ID !", 404));
  } else {
    if (!deletedunit) {
      return next(new ApiErrors(`No unit found for this unitID: ${id} !`, 404));
    }

    res.status(200).json({ 
      message: "unit is deleted successfully !",
      status: 200,
      data: deletedunit });
  }
});


//manage product OP //
//--------------------------------------
//add Tawalf_productOP for Unit
exports.addProductsOPToUnit = asyncHandler(async (req, res, next) => {
  const { unitId } = req.params;
  const { productIds } = req.body; // مصفوفة IDs للمنتجات

  const unit = await UnitModel.findById(unitId);
  if (!unit) return next(new ApiErrors("Unit not found", 404));

  // التأكد من أن Tawalf_productOP موجودة، إذا لا اعتبرها مصفوفة فارغة
  const currentProducts = Array.isArray(unit.Tawalf_productOP) ? unit.Tawalf_productOP : [];

  // تحويل كل ObjectId إلى String لتجنب التكرار
  const updatedProducts = Array.from(
    new Set([...currentProducts.map(id => id.toString()), ...productIds])
  );

  unit.Tawalf_productOP = updatedProducts;
  await unit.save();

  res.status(200).json({
    success: true,
    message: "✅ Products added successfully",
    data: unit
  });
});

//remove Tawalf_productOP for Unit
exports.removeProductOPFromUnit = asyncHandler(async (req, res, next) => {
  const { unitId } = req.params;
  const { productIds } = req.body; // مصفوفة IDs للمنتجات اللي عايز تمسحها

  if (!Array.isArray(productIds) || productIds.length === 0) {
    return next(new ApiErrors("Please provide an array of product IDs", 400));
  }

  const unit = await UnitModel.findById(unitId);
  if (!unit) return next(new ApiErrors("Unit not found", 404));

  const currentProducts = Array.isArray(unit.Tawalf_productOP) ? unit.Tawalf_productOP : [];

  // إزالة كل المنتجات اللي موجودة في مصفوفة productIds
  unit.Tawalf_productOP = currentProducts.filter(
    id => !productIds.includes(id.toString())
  );

  await unit.save();

  res.status(200).json({
    success: true,
    message: "🗑️ Products removed successfully",
    data: unit
  });
});
