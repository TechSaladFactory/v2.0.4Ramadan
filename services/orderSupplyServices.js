const { default: slugify } = require("slugify");
const { orderSupplyModel } = require("../models/orderSupplyModel");
const { BranchModel } = require("../models/branchModel");
const { productOPModel } = require("../models/productOPModel");
const { MainProductOPModel } = require("../models/mainProduct_OPModel");
const { UnitModel } = require("../models/unitModel");
const asyncHandler = require("express-async-handler");
const ApiErrors = require("../utils/apiErrors");
const searchByname = require("../utils/searchBykeyword");
const mongoose = require("mongoose");

// Get All orderSupplyModels
// GET /api/orderSupplyModel/getAll
exports.getAllorderSupply= asyncHandler(async (req, res) => {
  const filter = searchByname(req.query);

  const orders = await orderSupplyModel.find(filter)
     .populate({ path: "branch", select: "name" })
     .populate({ path: "product", select: "name" })
     .populate({ path: "packageUnit", select: "name" })
    .populate({ path: "mainProductOP" ,select: "name" } );

  res.status(200).json({
    data: orders,
    itemsnumber: orders.length,
    status: 200,
  });
});


exports.getOrderSof2Days = asyncHandler(async (req, res) => {
  // 🕒 حساب التاريخ من يومين
  const twoDaysAgo = new Date();
  twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

  // 📦 البحث عن الطلبات اللي createdAt بعد آخر يومين
  const orders = await orderSupplyModel.find({
    createdAt: { $gte: twoDaysAgo }
  })
    .populate({ path: "branch", select: "name" })
    .populate({ path: "product", select: "name" })
    .populate({ path: "packageUnit", select: "name" })
    .populate({ path: "mainProductOP", select: "name" });

  const uniqueBranches = await orderSupplyModel.distinct("branch", {
    createdAt: { $gte: twoDaysAgo },
    isSend: false, 
  });
  res.status(200).json({
    data: orders,
    itemsnumber: orders.length,
    branchesnumber:uniqueBranches.length,
    status: 200,
  });
});


// Get Specific orderSupplyModel By ID
// GET /api/orderSupplyModel/:id
exports.getorderSupplyById = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const order = await orderSupplyModel.findById(id)
  .populate({ path: "branch", select: "name" })
  .populate({ path: "product", select: "name" })
  .populate({ path: "packageUnit", select: "name" })
 .populate({ path: "mainProductOP" ,select: "name" } );

  if (!order) {
    return next(new ApiErrors(`No order Supply found for ID: ${id}`, 404));
  }

  res.status(200).json({ data: order, status: 200 });
});

// Create New orderSupplyModel
// POST /api/orderSupplyModel
exports.createorderSupply = asyncHandler(async (req, res, next) => {
  const {
    branch,
    product,
    package, // الآن اختياري، فلا حاجة لفرضه
    qty,
    ordername,
    mainProductOP,
    packageUnit,
  } = req.body;

  // التحقق من الحقول الأساسية المطلوبة فقط
  if (!branch || !product || !qty) {
    return next(new ApiErrors("Fields (branch, product, qty) are required!", 400));
  }

  // تحقق من الـ branch
  const branchExists = await BranchModel.findById(branch);
  if (!branchExists) {
    return next(new ApiErrors("Invalid branch ID!", 400));
  }

  // تحقق من المنتج
  const productExists = await productOPModel.findById(product);
  if (!productExists) {
    return next(new ApiErrors("Invalid product ID!", 400));
  }

  // تحقق من packageUnit إذا تم إرساله
  if (packageUnit !== undefined && packageUnit !== null && packageUnit !== "") {
    if (!mongoose.Types.ObjectId.isValid(packageUnit)) {
      return next(new ApiErrors("Invalid Unit ID format!", 400));
    }

    const isexistUnit = await UnitModel.findById(packageUnit);
    if (!isexistUnit) {
      return next(new ApiErrors(`This Unit doesn't exist!`, 400));
    }
  }

  // تحقق من mainProductOP إذا تم إرساله
  if (mainProductOP !== undefined && mainProductOP !== null && mainProductOP !== "") {
    if (!mongoose.Types.ObjectId.isValid(mainProductOP)) {
      return next(new ApiErrors("Invalid mainProductOP ID format!", 400));
    }

    const mainProductExists = await MainProductOPModel.findById(mainProductOP);
    if (!mainProductExists) {
      return next(new ApiErrors("Invalid mainProductOP ID!", 400));
    }
  }

  // إنشاء الطلب
  const newOrder = await orderSupplyModel.create({
    branch,
    product,
    packageUnit: packageUnit || null,
    mainProductOP: mainProductOP || null,
    package: package || null,
    qty,
    ordername: ordername || "",
  });

  res.status(200).json({
    message: "Order Supply created successfully!",
    status: 200,
    data: newOrder,
  });
});

// Update orderSupplyModel
// PUT /api/orderSupplyModel/:id
exports.updateorderSupply = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { branch, product, packageUnit, package, qty, ordername } = req.body;

  const order = await orderSupplyModel.findById(id);
  if (!order) {
    return next(new ApiErrors(`No order Supply found for ID: ${id}`, 404));
  }

  // ✅ لو الكمية = 0 نحذف الأوردر
  if (qty === 0) {
    await orderSupplyModel.findByIdAndDelete(id);
    return res.status(200).json({
      message: "Order Supply deleted because qty = 0",
      status: 200,
    });
  }
 if (qty < 0) {
    return next(new ApiErrors("Quantity cannot be negative!", 400));
  }
  if (branch && !(await BranchModel.findById(branch))) {
    return next(new ApiErrors("Invalid branch ID!", 400));
  }

  if (product && !(await productOPModel.findById(product))) {
    return next(new ApiErrors("Invalid product ID!", 400));
  }

  if (packageUnit !== undefined) {
    if (packageUnit !== null) {
      const isexistUnit = await UnitModel.findById(packageUnit);
      if (!isexistUnit) {
        return next(new ApiErrors(`This Unit doesn't exist!`, 400));
      }
    }
    order.packageUnit = packageUnit;
  }

  if (branch !== undefined) order.branch = branch;
  if (product !== undefined) order.product = product;
  if (package !== undefined) order.package = package;
  if (qty !== undefined) order.qty = qty;
  if (ordername !== undefined) order.ordername = ordername;

  await order.save();

  res.status(200).json({
    message: "Order Supply updated successfully!",
    status: 200,
    data: order,
  });
});

// Delete orderSupplyModel
// DELETE /api/orderSupplyModel/:id
exports.deleteorderSupply = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const deleted = await orderSupplyModel.findByIdAndDelete(id);

  if (!deleted) {
    return next(new ApiErrors(`No order Supply found for ID: ${id}`, 404));
  }

  res.status(200).json({
    message: "Order Supply deleted successfully!",
    status: 200,
    data: deleted,
  });
});


exports.Issended=asyncHandler(async(req,res,next) => {
  const {id}=req.params
  const {isSend}=req.body
   const orderData=await orderSupplyModel.findByIdAndUpdate({_id:id},{
    isSend
   },{new:true})
  
  if(!orderData){
    return next(new ApiErrors(`No order production found for ID: ${id}`, 404));
  
  }
  const value =isSend==true?"isSended Success":"Not Sended"
  res.status(200).json({
    message:value,
    status:200
  })
  
  })
