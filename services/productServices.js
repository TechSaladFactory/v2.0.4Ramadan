const { default: slugify } = require("slugify");
const { productModel } = require("../models/productModel");
const asyncHandler = require("express-async-handler");
const ApiErrors = require("../utils/apiErrors");
const { uploadImage } = require("../utils/imageUploadedtoCloudinary");
const ExcelJS = require("exceljs");

//Get All products
//roure >> Get Method
// /api/product/getAll
exports.getproduct = asyncHandler(async (req, res) => {
  const allproduct = await productModel
    .find({})
    .populate({ path: "unit", select: "name" })
    .populate({ path: "supplierAccepted", select: "name" })
    .populate({ path: "supplierAccepted", select: "name" })
    .populate({ path: "mainProduct", select: "name" });
  res.status(200).json({
    data: allproduct,
    itemsnumber: allproduct.length,
    status: 200,
  });
});
//Get Special Category By id
//roure >> Get Method
// /api/product/id
exports.getSpecialproductByid = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const productByid = await productModel
    .findById({ _id: id })
    .populate({ path: "unit", select: "name" })
    .populate({ path: "supplierAccepted", select: "name" })
    .populate({ path: "mainProduct", select: "name" });


  if (!productByid) {
    return next(
      new ApiErrors(`No product found for this productID: ${id} !`, 404),
    );
  }

  res.status(200).json({ data: productByid, status: 200 });
});
//create new category
//roure >> Post Method
// /api/product/addcategory
exports.addproduct = asyncHandler(async (req, res, next) => {
  const { name, bracode, availableQuantity, unit, supplierAccepted, mainProduct, packSize, expireDate, price, updated, quantity } = req.body;
    const productresponse = await productModel.create({
      name,
      bracode,
      availableQuantity,
      unit,
      supplierAccepted,
      mainProduct,
      packSize,
      updated: [{ expireDate, quantity:availableQuantity }],
      price
    });

    res.status(200).json({
      data: productresponse,
      message: "product is added successfully !",
      status: 200,
    });
  
});
//qty expired 

exports.addqtyAndexpiredByBarcode = asyncHandler(async (req, res, next) => {
  const { expireDate, quantity, bracode ,priceIN } = req.body;

  const productresponse = await productModel.findOneAndUpdate(
    { bracode},
    {
      $push: {
        updated: { expireDate, quantity,priceIN }
      },
      $inc: {
        availableQuantity: quantity
      },
      price:priceIN
    },
    { new: true }
  );

  if (!productresponse) {
    return next(new ApiErrors(`This product with this barcode doesn't exist!`, 404));
  }

  res.status(200).json({
    data: productresponse,
    message: "Quantity and expiration date added successfully, and available quantity increased!",
    status: 200,
  });
});

//OUt
exports.subtractQuantityByBarcode = asyncHandler(async (req, res, next) => {
  const { bracode, quantityToSubtract } = req.body;

  if (!bracode || !quantityToSubtract || quantityToSubtract <= 0) {
    return next(new ApiErrors("Barcode and valid quantityToSubtract are required", 400));
  }

  // 1. هات المنتج حسب الباركود
  const product = await productModel.findOne({ bracode });

  if (!product) {
    return next(new ApiErrors("Product not found!", 404));
  }

  if (product.availableQuantity < quantityToSubtract) {
    return next(new ApiErrors("Not enough quantity available!", 400));
  }

  let qtyToSubtract = quantityToSubtract;

  // 2. رتب الـ updated حسب أقرب تاريخ انتهاء
  product.updated.sort((a, b) => new Date(a.expireDate) - new Date(b.expireDate));

  // 3. امشي على التواريخ و اطرح الكمية تدريجيا
  for (let i = 0; i < product.updated.length && qtyToSubtract > 0; i++) {
    let entry = product.updated[i];
    if (entry.quantity <= qtyToSubtract) {
      // هتخصم كل الكمية وتخلي الكمية صفر
      qtyToSubtract -= entry.quantity;
      entry.quantity = 0;
    } else {
      // هتخصم جزء وتسيب الباقي
      entry.quantity -= qtyToSubtract;
      qtyToSubtract = 0;
    }
  }

  // 4. احذف أي عنصر بقى كميته صفر
  product.updated = product.updated.filter(entry => entry.quantity > 0);

  // 5. نقص من availableQuantity
  product.availableQuantity -= quantityToSubtract;

  await product.save();

  res.status(200).json({
    message: "Quantity subtracted successfully!",
    data: product,
    status: 200
  });
});

//Update to Special product
//roure >> Update Method
// /api/product/id
exports.updateproductByID = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  // ناخد كل البيانات اللي جايه في الـ body
  const updateFields = req.body;

  // لو جت صورة مع الريكوست (في حالة اختيارية)
  if (req.file) {
    const image = await uploadImage(req, "products", next);
    updateFields.image = image;
  }

  // تحديث المنتج بالبيانات الجديدة فقط
  const productAfterUpdated = await productModel
    .findOneAndUpdate({ _id: id }, updateFields, { new: true })
    .populate({ path: "unit", select: "name" })
    .populate({ path: "supplierAccepted", select: "name" })
    .populate({ path: "mainProduct", select: "name" });

  if (!productAfterUpdated) {
    return next(new ApiErrors(`No product found for this productID: ${id} !`, 404));
  }

  res.status(200).json({
    message: "Product is updated successfully!",
    status: 200,
    data: productAfterUpdated,
  });
});

//Delete product
//roure >> Delete Method
// /api/product/id

exports.deleteproductByID = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const deletedproduct = await productModel.findOneAndDelete({ _id: id });

  if (id === undefined) {
    return next(new ApiErrors("set product ID !", 404));
  } else {
    if (!deletedproduct) {
      return next(
        new ApiErrors(`No product found for this productID: ${id} !`, 404),
      );
    }

    res.status(200).json({
      message: "product is deleted successfully !",
      status: 200,
      data: deletedproduct,
    });
  }
});

//update minQty

exports.minQty = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { minQuantity } = req.body;

  if (!minQuantity || minQuantity === undefined || minQuantity === "") {
    new ApiErrors(`minQuantity is required !`, 404);
  }
  const productAfterUpdated = await productModel
    .findOneAndUpdate({ _id: id }, { minQuantity }, { new: true })
    .populate({ path: "unit", select: "name" })
    .populate({ path: "supplierAccepted", select: "name" })
    .populate({ path: "mainProduct", select: "name" });

  console.log(11);
  if (productAfterUpdated) {
    res.status(200).json({
      message: "product minQuantity is updated successfully !",
      status: 200,
      data: productAfterUpdated,
    });
  }
  if (!productAfterUpdated) {
    return next(
      new ApiErrors(`No product found for this productID: ${id} !`, 404),
    );
  }
});

exports.productByBarCode = asyncHandler(async (req, res, next) => {
  const { bracode } = req.body;
  if (!bracode) {
    return next(new ApiErrors("Barcode is required", 400));
  }

  const product = await productModel
    .findOne({ bracode })
    .populate({ path: "unit", select: "name" })
    .populate({ path: "supplierAccepted", select: "name" })
    .populate({ path: "mainProduct", select: "name" });


  if (!product) {
    return next(
      new ApiErrors(`No product found for this barcode: ${bracode} !`, 404),
    );
  }

  res.status(200).json({ data: product, status: 200 });
});

exports.downloadProductByIdExcel = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const product = await productModel
    .findById(id)
    .populate({ path: "unit", select: "name" })
    .populate({ path: "supplierAccepted", select: "name" });

  if (!product) {
    return next(
      new ApiErrors(`No product found for this productID: ${id} !`, 404),
    );
  }

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Product Details");

  worksheet.columns = [
    { header: "المنتج", key: "name", width: 30 },
    { header: "الباركود", key: "bracode", width: 20 },
    { header: "الكمية المتاحة", key: "availableQuantity", width: 20 },
    { header: "الحد الادني", key: "minQuantity", width: 20 },
    { header: "وحدة القياس", key: "unit", width: 20 },
    { header: "المورد", key: "supplier", width: 30 },
    { header: "تم الانشاء", key: "createdAt", width: 25 },
  ];

  worksheet.addRow({
    name: product.name,
    bracode: product.bracode,
    availableQuantity: product.availableQuantity,
    minQuantity: product.minQuantity || "",
    unit: product.unit?.name || "",
    supplier: product.supplierAccepted?.name || "",
    createdAt: product.createdAt.toISOString().slice(0, 19).replace("T", " "),
  });

  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  );
  res.setHeader(
    "Content-Disposition",
    `attachment; filename=product_${id}.xlsx`,
  );

  await workbook.xlsx.write(res);
  res.status(200).end();
});

exports.downloadAllProductsExcel = asyncHandler(async (req, res, next) => {
  const allProducts = await productModel
    .find({})
    .populate({ path: "unit", select: "name" })
    .populate({ path: "supplierAccepted", select: "name" });

  if (allProducts.length === 0) {
    return next(new ApiErrors("لا يوجد منتجات حالياً.", 404));
  }

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("All Products");

  worksheet.columns = [
    { header: "المنتج", key: "name", width: 30 },
    { header: "الباركود", key: "bracode", width: 20 },
    { header: "الكمية المتاحة", key: "availableQuantity", width: 20 },
    { header: "الحد الأدنى", key: "minQuantity", width: 20 },
    { header: "وحدة القياس", key: "unit", width: 20 },
    { header: "المورد", key: "supplier", width: 30 },
    { header: "تاريخ الإنشاء", key: "createdAt", width: 25 },
  ];

  allProducts.forEach((product) => {
    worksheet.addRow({
      name: product.name,
      bracode: product.bracode || "",
      availableQuantity: product.availableQuantity || "",
      minQuantity: product.minQuantity || "",
      unit: product.unit?.name || "",
      supplier: product.supplierAccepted?.name || "",
      createdAt:
        product.createdAt?.toISOString().slice(0, 19).replace("T", " ") || "",
    });
  });

  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  );
  res.setHeader(
    "Content-Disposition",
    "attachment; filename=all_products.xlsx",
  );

  await workbook.xlsx.write(res);
  res.status(200).end();
});


//getrelatedMainProduct
exports.getrelatedMainProduct = asyncHandler(async (req, res, next) => {
  const id = req.params.id;

  const relatedProducts = await productModel.find({
    mainProduct: id
  }).populate('unit supplierAccepted mainProduct');

  if (!relatedProducts || relatedProducts.length === 0) {
    return next(new ApiErrors("لا يوجد منتجات مرتبطة حالياً.", 404));
  }

  res.status(200).json({
    data: relatedProducts,
    status: 200,
    itemsnumber: relatedProducts.length,
  });
});



exports.getrealtedOrderProduction = asyncHandler(async (req, res) => {
  const allproduct = await productModel
    .find({ isorderProduction: true }) // استخدم find بدلاً من findOne
    .populate({ path: "unit", select: "name" })
    .populate({ path: "supplierAccepted", select: "name" })
    .populate({ path: "mainProduct", select: "name" });

  res.status(200).json({
    data: allproduct,
    itemsnumber: allproduct.length,
    status: 200,
  });
});
