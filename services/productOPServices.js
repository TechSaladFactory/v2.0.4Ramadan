const { default: slugify } = require("slugify");
const { productOPModel } = require("../models/productOPModel");
const { MainProductOPModel } = require("../models/mainProduct_OPModel");
const asyncHandler = require("express-async-handler");
const ApiErrors = require("../utils/apiErrors");
const {ProductionModel} =require("../models/ProductionModel")
const {UnitModel} =require("../models/unitModel")
const {ProductionRequestModel} =require("../models/ProductionRequest")

const {OrderProductionModel} =require("../models/orderProductionModel")

// ✅ Get All Products
exports.getproductOP = asyncHandler(async (req, res) => {
  const allproductOP = await productOPModel
    .find({})
    .populate({ path: "mainProductOP", select: "name order" })
    .populate({ path: "packageUnit", select: "name" });

  res.status(200).json({
    data: allproductOP,
    itemsnumber: allproductOP.length,
    status: 200,
  });
});

// ✅ Get Single Product by ID
exports.getSpecialproductOPByid = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const productOPByid = await productOPModel
    .findById(id)
    .populate({ path: "mainProductOP", select: "name" });

  if (!productOPByid) {
    return next(new ApiErrors(`No productOP found with ID: ${id}`, 404));
  }

  res.status(200).json({ data: productOPByid, status: 200 });
});

// ✅ Create New Product
exports.addproductOP = asyncHandler(async (req, res, next) => {
  const {
    name,
    bracode,
    packSize,
    mainProductOP,
    isorderProduction,
    packageUnit
  } = req.body;

  // التحقق من المنتج الرئيسي
  const isexistMainProduct = await MainProductOPModel.findById(mainProductOP);
  if (!isexistMainProduct) {
    return next(
      new ApiErrors(`No MainProductOP found for this MainProductID: ${mainProductOP} !`, 404)
    );
  }

  // التحقق من وجود منتج فرعي بنفس الاسم
  const isexistproductOPname = await productOPModel.findOne({ name });
  if (isexistproductOPname) {
    return next(new ApiErrors(`ProductOP name already exists!`, 400));
  }

  // ✅ التحقق من الوحدة إذا كانت موجودة فقط
  if (packageUnit) {
    const isexistUnit = await UnitModel.findById(packageUnit);
    if (!isexistUnit) {
      return next(new ApiErrors(`This Unit doesn't exist!`, 400));
    }
  }

  // إنشاء المنتج
  const productOP = await productOPModel.create({
    name,
    bracode,
    packSize,
    mainProductOP,
    packageUnit: packageUnit || null, // حفظ null إذا لم تُرسل
    isorderProduction,
    slug: slugify(name),
  });

  res.status(200).json({
    data: productOP,
    message: "Product created successfully",
    status: 200,
  });
});


// ✅ Update Product by ID
exports.updateproductOPByID = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { name, bracode, packSize, mainProductOP, isorderProduction, packageUnit } = req.body;

  const product = await productOPModel.findById(id);
  if (!product) {
    return next(new ApiErrors(`No product found with ID: ${id}`, 404));
  }

  // التحقق من المنتج الرئيسي إذا تم تغييره
  if (mainProductOP) {
    const isexistMainProduct = await MainProductOPModel.findById(mainProductOP);
    if (!isexistMainProduct) {
      return next(
        new ApiErrors(`No MainProductOP found for this MainProductID: ${mainProductOP} !`, 404)
      );
    }
  }

  // التحقق من الاسم الجديد إذا تغير
  if (name && name !== product.name) {
    const isexistproductOPname = await productOPModel.findOne({ name });
    if (isexistproductOPname) {
      return next(new ApiErrors(`ProductOP name already exists!`, 400));
    }
  }

  // ✅ التحقق من الوحدة إذا كانت موجودة فقط وغير null
  if (packageUnit !== undefined) {
    if (packageUnit !== null) {
      const isexistUnit = await UnitModel.findById(packageUnit);
      if (!isexistUnit) {
        return next(new ApiErrors(`This Unit doesn't exist!`, 400));
      }
    }
  }

  // إعداد الحقول التي سيتم تحديثها
  const updatedFields = {
    ...(name && { name }),
    ...(bracode && { bracode }),
    ...(packSize && { packSize }),
    ...(mainProductOP && { mainProductOP }),
    ...(typeof isorderProduction === "boolean" && { isorderProduction }),
    ...(name && { slug: slugify(name) }),
  };

  // نضيف packageUnit سواء null أو ObjectId
  if (packageUnit !== undefined) {
    updatedFields.packageUnit = packageUnit;
  }

  const updatedProduct = await productOPModel.findByIdAndUpdate(id, updatedFields, { new: true });

  res.status(200).json({
    data: updatedProduct,
    message: "Product updated successfully",
    status: 200,
  });
});


// ✅ Delete Product by ID
// exports.deleteproductOPByID = asyncHandler(async (req, res, next) => {
//   const { id } = req.params;

//   const deletedProduct = await productOPModel.findByIdAndDelete(id);

//   if (!deletedProduct) {
//     return next(new ApiErrors(`No product found with ID: ${id}`, 404));
//   }

//   res.status(200).json({
//     message: "Product deleted successfully",
//     data: deletedProduct,
//     status: 200,
//   });
// });

exports.deleteproductOPByID = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  // تأكد إن await هنا داخل دالة async
  const deletedProduct = await productOPModel.findByIdAndDelete(id);

  if (!deletedProduct) {
    return next(new ApiErrors(`No product found with ID: ${id}`, 404));
  }

  // حذف من ProductionModel كمان
  await ProductionModel.deleteMany({ product: id });
  await ProductionRequestModel.deleteMany({ product: id });
  await OrderProductionModel.deleteMany({ product: id });

  res.status(200).json({
    message: "Product and related productions deleted successfully",
    data: deletedProduct,
    status: 200,
  });
});


// ✅ Get All Products Related to a Main Product
exports.getrelatedMainproductOP = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const relatedProducts = await productOPModel
    .find({ mainProductOP: id })
    .populate({ path: "mainProductOP", select: "name" });

  if (!relatedProducts || relatedProducts.length === 0) {
    return next(new ApiErrors("No related products found.", 404));
  }

  res.status(200).json({
    data: relatedProducts,
    status: 200,
    itemsnumber: relatedProducts.length,
  });
});

// ✅ Get Products Marked for Production
exports.getrealtedOrderproductOPion = asyncHandler(async (req, res) => {
  const products = await productOPModel
    .find({ isorderProduction: true })
    .populate({ path: "mainProductOP", select: "name" });

  res.status(200).json({
    data: products,
    itemsnumber: products.length,
    status: 200,
  });
});



exports.updateProductIsSupply = asyncHandler(async (req, res) => {
  const { isorderSupply } = req.body; // true or false

  const product = await productOPModel.findByIdAndUpdate(
    req.params.id,
    { isorderSupply },
    { new: true, runValidators: true }
  );

  if (!product) {
    return res.status(404).json({
      status: "fail",
      message: "Product not found",
    });
  }

  res.status(200).json({
    status:isorderSupply==true? "Allowed to Show in OrderSupply":"Denied to Show in OrderSupply",
    data: product,
  });
});


exports.updateProductIsTawalf = asyncHandler(async (req, res) => {
  const { isTawalf } = req.body; // true or false

  const product = await productOPModel.findByIdAndUpdate(
    req.params.id,
    { isTawalf },
    { new: true, runValidators: true }
  );

  if (!product) {
    return res.status(404).json({
      status: "fail",
      message: "Product not found",
    });
  }

  res.status(200).json({
    status:isTawalf==true? "Allowed to Show in Tawalf":"Denied to Show in Tawalf",
    data: product,
  });
});
