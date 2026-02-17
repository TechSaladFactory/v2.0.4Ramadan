const { default: slugify } = require("slugify");
const { MainProductOPModel } = require("../models/mainProduct_OPModel");
const asyncHandler = require("express-async-handler");
const ApiErrors = require("../utils/apiErrors");
const searchByname = require("../utils/searchBykeyword");
const { productOPModel } = require("../models/productOPModel");
const mongoose = require("mongoose");

// Get All mainProductOP
// Route: GET /api/mainProductOP/getAll
exports.getmainProductOP = asyncHandler(async (req, res) => {
  const filter = searchByname(req.query);
  const allmainProductOP = await MainProductOPModel.find(filter);

  // اجلب عدد المنتجات لكل منتج رئيسي
  const counts = await productOPModel.aggregate([
    {
      $group: {
        _id: "$mainProductOP", // بافتراض أن هذا الحقل فيه المرجع
        count: { $sum: 1 }
      }
    }
  ]);

  // حول النتيجة إلى شكل يسهل الدمج
  const countMap = {};
  counts.forEach((item) => {
    countMap[item._id?.toString()] = item.count;
  });

  // دمج العدد مع كل منتج رئيسي
  const result = allmainProductOP.map((main) => {
    return {
      ...main.toObject(),
      productOPCount: countMap[main._id.toString()] || 0,
    };
  });

  res.status(200).json({
    data: result,
    itemsNumber: result.length,
    status: 200,
  });
});

// Get Specific mainProductOP by ID
// Route: GET /api/mainProductOP/:id
exports.getSpecialmainProductOPByid = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const mainProductOPByid = await MainProductOPModel.findById(id);
  if (!mainProductOPByid) {
    return next(new ApiErrors(`No mainProductOP found for ID: ${id}`, 404));
  }

  res.status(200).json({
    data: mainProductOPByid,
    status: 200,
  });
});

// Create New mainProductOP
// Route: POST /api/mainProductOP/addmainProductOP
exports.addmainProductOP = asyncHandler(async (req, res, next) => {
  const { name } = req.body;

  if (name === undefined || name.trim() === "") {
    return next(new ApiErrors("Name is required and must not be empty!", 400));
  }

  const existing = await MainProductOPModel.findOne({ name });
  if (existing) {
    return next(new ApiErrors("mainProductOP with this name already exists!", 400));
  }

  const newMainProductOP = await MainProductOPModel.create({
    name,
    slug: slugify(name),
  });

  res.status(201).json({
    data: newMainProductOP,
    message: "mainProductOP is added successfully!",
    status: 201,
  });
});

// Update mainProductOP by ID
// Route: PUT /api/mainProductOP/:id
exports.updatemainProductOPByID = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { name } = req.body;

  if (name === undefined || name.trim() === "") {
    return next(new ApiErrors("mainProductOP name is required!", 400));
  }

  const updated = await MainProductOPModel.findByIdAndUpdate(
    id,
    { name, slug: slugify(name) },
    { new: true }
  );

  if (!updated) {
    return next(new ApiErrors(`No mainProductOP found for ID: ${id}`, 404));
  }

  res.status(200).json({
    message: "mainProductOP is updated successfully!",
    status: 200,
    data: updated,
  });
});

// Delete mainProductOP by ID
// Route: DELETE /api/mainProductOP/:id
exports.deletemainProductOPByID = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  if (!id) {
    return next(new ApiErrors("mainProductOP ID is required!", 400));
  }

  const deleted = await MainProductOPModel.findByIdAndDelete(id);
  if (!deleted) {
    return next(new ApiErrors(`No mainProductOP found for ID: ${id}`, 404));
  }

  res.status(200).json({
    message: "mainProductOP is deleted successfully!",
    status: 200,
    data: deleted,
  });
});



// updateProductsOrder

exports.updateProductsOrder = asyncHandler(async (req, res, next) => {
  const { products } = req.body;

  // التحقق من صحة البيانات المدخلة
  if (!products || !Array.isArray(products)) {
    return next(new ApiErrors("يجب تقديم مصفوفة من المنتجات مع معرفها وترتيبها", 400));
  }

  // التحقق من كل عنصر في المصفوفة
  for (const product of products) {
    if (!product.id || !mongoose.Types.ObjectId.isValid(product.id)) {
      return next(new ApiErrors("معرّف المنتج غير صالح", 400));
    }
    if (typeof product.order !== 'number' || product.order < 0) {
      return next(new ApiErrors("ترتيب المنتج يجب أن يكون رقمًا موجبًا", 400));
    }
  }

  try {
    // إعداد عمليات التحديث بالجملة
    const bulkOps = products.map((product) => ({
      updateOne: {
        filter: { _id: product.id },
        update: { $set: { order: product.order } }
      }
    }));

    // تنفيذ التحديثات بالجملة
    const result = await MainProductOPModel.bulkWrite(bulkOps);

    // التحقق من عدد العناصر المحدثة
    if (result.modifiedCount !== products.length) {
      console.warn(`بعض العناصر لم يتم تحديثها. المطلوب: ${products.length}, المحدث: ${result.modifiedCount}`);
    }

    res.status(200).json({
      message: "تم تحديث ترتيب المنتجات بنجاح",
      status: 200,
      data: {
        matchedCount: result.matchedCount,
        modifiedCount: result.modifiedCount,
        upsertedCount: result.upsertedCount
      },
    });
  } catch (error) {
    console.error('فشل في تحديث الترتيب:', error);
    return next(new ApiErrors("حدث خطأ أثناء تحديث ترتيب المنتجات", 500));
  }
});