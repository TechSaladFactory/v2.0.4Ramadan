// const asyncHandler = require("express-async-handler");
// const {ProductionModel} = require("../models/ProductionModel");
// const {productOPModel} = require("../models/productOPModel");
// const {ProductionRequestModel} = require("../models/ProductionRequest");

// const ApiErrors = require("../utils/apiErrors");

// // ✅ 1. إرسال طلب إنتاج (من المستخدم)
// // exports.sendProductionRequests = asyncHandler(async (req, res) => {
// //   const { items } = req.body;

// //   if (!Array.isArray(items) || items.length === 0) {
// //     return res.status(400).json({ message: "يجب إرسال عناصر المنتجات" });
// //   }

// //   for (const { productId, qty } of items) {
// //     const product = await productOPModel.findById(productId);
// //     if (!product) {
// //       return res.status(400).json({ message: `المنتج غير موجود: ${productId}` });
// //     }

// //     await ProductionRequestModel.create({
// //       product: productId,
// //       qty,
// //     });
// //   }

// //   res.status(200).json({
// //     message: "تم إرسال الطلبات في انتظار الاعتماد",
// //     status: 200,
// //   });
// // });


// exports.sendProductionRequests = asyncHandler(async (req, res) => {
//   const { items, isAdmin } = req.body;

//   if (!Array.isArray(items) || items.length === 0) {
//     return res.status(400).json({ message: "يجب إرسال عناصر المنتجات" });
//   }

//   for (const { productId, qty } of items) {
//     const product = await productOPModel.findById(productId);
//     if (!product) {
//       return res.status(400).json({ message: `المنتج غير موجود: ${productId}` });
//     }

//     if (isAdmin === true) {
//       // اعتماد مباشر
//       const existingProduction = await ProductionModel.findOne({ product: productId });

//       if (existingProduction) {
//         existingProduction.qty += qty;
//         await existingProduction.save();
//       } else {
//         await ProductionModel.create({
//           product: [productId],
//           qty,
//         });
//       }

//       await ProductionRequestModel.create({
//         product: productId,
//         qty,
//         approved: true,
//       });
//     } else {
//       // إرسال بدون اعتماد
//       await ProductionRequestModel.create({
//         product: productId,
//         qty,
//       });
//     }
//   }

//   const msg = isAdmin ? "تم اعتماد الطلبات مباشرة بنجاح" : "تم إرسال الطلبات في انتظار الاعتماد";

//   res.status(200).json({
//     message: msg,
//     status: 200,
//   });
// });


// // ✅ اعتماد مجموعة من طلبات الإنتاج المختارة من المشرف
// exports.approveSelectedProductionRequests = asyncHandler(async (req, res) => {
//   const { requestIds } = req.body;

//   if (!Array.isArray(requestIds) || requestIds.length === 0) {
//     return res.status(400).json({ message: "يجب إرسال قائمة الطلبات المطلوبة للاعتماد" });
//   }

//   let approvedCount = 0;

//   for (const requestId of requestIds) {
//     const request = await ProductionRequestModel.findById(requestId).populate("product");

//     if (!request || request.approved) continue;

//     const existingProduction = await ProductionModel.findOne({ product: request.product._id });

//     if (existingProduction) {
//       existingProduction.qty += request.qty;
//       await existingProduction.save();
//     } else {
//       await ProductionModel.create({
//         product: [request.product._id],
//         qty: request.qty,
//       });
//     }

//     request.approved = true;
//     await request.save();
//     approvedCount++;
//   }

//   res.status(200).json({
//     message: `تم اعتماد ${approvedCount} طلب بنجاح`,
//     approvedCount,
//     status: 200,
//   });
// });


// // ✅ 3. عرض الطلبات غير المعتمدة
// exports.getPendingProductionRequests = asyncHandler(async (req, res) => {
//   const requests = await ProductionRequestModel.find({ approved: false })
//   .populate({
//     path: "product",
//     populate: {
//       path: "mainProductOP",
//       select: "name", // اجلب فقط الاسم أو أي بيانات تحتاجها
//     },
//   }).populate({
//     path: "product",
//     populate: {
//       path: "packageUnit",
//       select: "name", // اجلب فقط الاسم أو أي بيانات تحتاجها
//     },
//   });
//   res.status(200).json({
//     data: requests,
//     itemsnumber: requests.length,
//     status: 200,
//   });
// });


// // ✅ 4. عرض الطلبات المعتمدة (اختياري)
// exports.getApprovedProductions = asyncHandler(async (req, res) => {
//   const productions = await ProductionModel.find()
//     .populate({
//       path: "product",
//       populate: {
//         path: "mainProductOP",
//         select: "name", // اجلب فقط الاسم أو أي بيانات تحتاجها
//       },
//     }).populate({
//       path: "product",
//       populate: {
//         path: "packageUnit",
//         select: "name", // اجلب فقط الاسم أو أي بيانات تحتاجها
//       },
//     });

//   res.status(200).json({
//     data: productions,
//     itemsnumber: productions.length,
//     status: 200,
//   });
// });
// 6


// //deletependingrequestByID
// exports.deletependingrequestByID = asyncHandler(async (req, res, next) => {
//   const { id } = req.params;

//   const deletedProductionrequest= await ProductionRequestModel.findOneAndDelete({ _id: id });

//   if (id === undefined) {
//     return next(new ApiErrors("set Production Pending request ID !", 404));
//   } else {
//     if (!deletedProductionrequest) {
//       return next(new ApiErrors(`No Production Pending requestID for this Production Pending requestID: ${id} !`, 404));
//     }

//     res.status(200).json({ 
//       message: "Production Pending request deleted successfully !",
//       status: 200,
//       data: deletedProductionrequest});
//   }
// });



// //delete accpeted


// exports.deleteaccpetedProductionByID = asyncHandler(async (req, res, next) => {
//   const { id } = req.params;

//   const deletedProductionrequest= await ProductionModel.findOneAndDelete({ _id: id });

//   if (id === undefined) {
//     return next(new ApiErrors("set accpeted Production Id!", 404));
//   } else {
//     if (!deletedProductionrequest) {
//       return next(new ApiErrors(`No Production accpetedID for this Production accpetedID: ${id} !`, 404));
//     }

//     res.status(200).json({ 
//       message: "Production accpeted deleted successfully !",
//       status: 200,
//       data: deletedProductionrequest});
//   }
// });




// exports.updatePendingRequestQtyByID = asyncHandler(async (req, res, next) => {
//   const { id } = req.params;
//   const { qty } = req.body;

//   if (!id) {
//     return next(new ApiErrors("Please provide the Production Request ID", 400));
//   }

//   if (qty === undefined) {
//     return next(new ApiErrors("Please provide the new quantity (qty)", 400));
//   }

//   const updatedRequest = await ProductionRequestModel.findByIdAndUpdate(
//     id,
//     { qty }, // Make sure this field name matches your schema
//     { new: true, runValidators: true }
//   );

//   if (!updatedRequest) {
//     return next(new ApiErrors(`No Production Request found with ID: ${id}`, 404));
//   }

//   res.status(200).json({
//     message: "Production Request quantity updated successfully",
//     status: 200,
//     data: updatedRequest,
//   });
// });


// exports.updateProductionQty = asyncHandler(async (req, res) => {
//   const { id } = req.params;
//   const { qty } = req.body;

//   if (qty < 0) {
//     return res.status(400).json({ message: "Quantity cannot be negative" });
//   }

//   const updatedProduction = await ProductionModel.findByIdAndUpdate(
//     id,
//     { qty },
//     { new: true, runValidators: true }
//   );

//   if (!updatedProduction) {
//     return res.status(404).json({ message: "Production not found" });
//   }

//   res.status(200).json({
//     status: "success",
//     data: updatedProduction,
//   });
// });

// // تعديل آخر عملية إنتاج لمنتج معين
// exports.updateLastProductionByProduct = asyncHandler(async (req, res, next) => {
//   const { productId } = req.params; // أو تبعتها من body
//   const { qty } = req.body;

//   if (!productId) {
//     return next(new ApiErrors("Please provide productId", 400));
//   }

//   if (qty === undefined || isNaN(qty) || qty < 0) {
//     return next(new ApiErrors("Please provide a valid quantity (qty >= 0)", 400));
//   }

//   // هات آخر عملية إنتاج للمنتج المطلوب
//   const lastProduction = await ProductionModel.findOne({ product: productId })
//     .sort({ createdAt: -1 });

//   if (!lastProduction) {
//     return next(new ApiErrors(`No Production found for productId: ${productId}`, 404));
//   }

//   lastProduction.qty = qty;
//   await lastProduction.save();

//   res.status(200).json({
//     message: "Last production updated successfully",
//     status: 200,
//     data: lastProduction,
//   });
// });

const asyncHandler = require("express-async-handler");
const { ProductionModel } = require("../models/ProductionModel");
const { productOPModel } = require("../models/productOPModel");
const { ProductionRequestModel } = require("../models/ProductionRequest");
const { ProductionHistoryModel } = require("../models/ProductionHistoryModel");
const ApiErrors = require("../utils/apiErrors");
const ExcelJS = require("exceljs");
const {SendHistoryModel  } = require('../models/sendHistory');

const { SendProcessHistoryModel } = require("../models/sendProcesModel");


// 🟢 تعديل عملية في History + Sync مع Production (بدون إضافة جديد)
// 🟢 تعديل عملية في History + Sync مع Production (بالفرق مش الاستبدال)
// exports.updateHistoryAndSync = asyncHandler(async (req, res, next) => {
//   const { historyId } = req.params;
//   const { items } = req.body;

//   const history = await ProductionHistoryModel.findById(historyId);
//   if (!history) {
//     return next(new ApiErrors("History record not found", 404));
//   }

//   // ✅ تعديل الكميات بالفرق
//   for (const { product, qty: newQty } of items) {
//     const oldItem = history.items.find(i => i.product.toString() === product.toString());
//     const oldQty = oldItem ? oldItem.qty : 0;

//     const diff = newQty - oldQty; // الفرق بين القديم والجديد

//     let prod = await ProductionModel.findOne({ product });
//     if (!prod) {
//       return next(new ApiErrors(`المنتج ${product} غير موجود في الإنتاج`, 400));
//     }

//     prod.qty += diff; // تعديل بالفرق فقط
//     if (prod.qty < 0) prod.qty = 0; // ضمان عدم السالب
//     await prod.save();
//   }

//   // ✅ تحديث الـ History
//   history.items = items;
//   history.action = "update";
//   await history.save();

//   res.status(200).json({
//     message: "History updated and Production synced with quantity differences",
//     status: 200,
//     data: history,
//   });
// });


exports.updateHistoryAndSync = asyncHandler(async (req, res, next) => {
  const { historyId } = req.params;
  const { items, userId, note, locationProcess } = req.body;

  const history = await ProductionHistoryModel.findById(historyId);
  if (!history) {
    return next(new ApiErrors("History record not found", 404));
  }

  const changesLog = []; // لتجميع تفاصيل التغييرات

  // ✅ تعديل الكميات بالفرق مع حفظ التفاصيل
  for (const { product, qty: newQty } of items) {
    const oldItem = history.items.find(
      (i) => i.product.toString() === product.toString()
    );
    const oldQty = oldItem ? oldItem.qty : 0;
    const diff = newQty - oldQty;

    // نجيب المنتج من جدول الإنتاج
    let prod = await ProductionModel.findOne({ product });
    if (!prod) {
      return next(new ApiErrors(`المنتج ${product} غير موجود في الإنتاج`, 400));
    }

    prod.qty += diff;
    if (prod.qty < 0) prod.qty = 0;
    await prod.save();

    // نجيب اسم المنتج من جدول المنتجات (اختياري)
    const productData = await productOPModel.findById(product).select("name");

    // نضيف التفاصيل إلى سجل التغييرات
    changesLog.push({
      productId: product,
      productName: productData ? productData.name : "غير معروف",
      oldQty,
      newQty,
      diff,
    });
  }

  // ✅ تحديث سجل الـ History نفسه
  history.items = items;
  history.action = "update";
  await history.save();

  // ✅ إنشاء سجل العملية في ProcessHistory بالتفاصيل
  await SendProcessHistoryModel.create({
    user: userId|| null,
    typeProcess: "update",
    note: note || "تعديل كميات الإنتاج",
    relatedHistory: history._id,
    modelType: "ProductionHistory",
    locationProcess: locationProcess || "Production Section",
    changes: changesLog, // ⬅️ إضافة تفاصيل التغييرات هنا
  });

  res.status(200).json({
    message: "تم تعديل الكميات وتسجيل التغييرات بالتفصيل",
    status: 200,
    data: {
      history,
      changes: changesLog,
    },
  });
});


// 🟢 عرض كل History
exports.getAllHistory = asyncHandler(async (req, res) => {
  const { page, limit } = req.query;

  let query = ProductionHistoryModel.find()
    .sort({ createdAt: -1 }) // 🔥 الأحدث في الأول
    .populate([
      {
        path: "items.product",
        select: "name packSize packageUnit mainProductOP",
        populate: [
          { path: "packageUnit", select: "name" },
          { path: "mainProductOP", select: "name order" }
        ]
      },
      { path: "branch", select: "name" }
    ])
    .lean();

  let total = await ProductionHistoryModel.countDocuments();

  // لو pagination موجودة
  if (page && limit) {
    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);
    const skip = (pageNumber - 1) * limitNumber;

    query = query.skip(skip).limit(limitNumber);
  }

  const history = await query;

  res.status(200).json({
    data: history,
    currentPage: page ? parseInt(page) : null,
    totalPages: page && limit ? Math.ceil(total / parseInt(limit)) : null,
    totalItems: total,
    status: 200,
  });
});



// 🟢 إرسال طلب إنتاج (User أو Admin)
exports.sendProductionRequests = asyncHandler(async (req, res) => {
  const { items, isAdmin, branch, isSend ,userID} = req.body;

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: "يجب إرسال عناصر المنتجات" });
  }

  // تحقق من وجود المنتجات
  for (const { productId } of items) {
    const product = await productOPModel.findById(productId);
    if (!product) {
      return res.status(400).json({ message: `المنتج غير موجود: ${productId}` });
    }
  }

  // 🟢 حفظ العملية في SendHistory
  const sendHistory = await SendHistoryModel.create({
    items: items.map(i => ({ product: i.productId, qty: i.qty })),
    isAdmin,
    branch,
    isSend,
    userID,
    status: isAdmin ? "approved" : "pending",
    note: isAdmin ? "اعتماد مباشر" : "طلب في انتظار الاعتماد",
    sendType:"انتاج"
  });

  if (isAdmin) {
    // ✅ تحديث Production
    for (const { productId, qty } of items) {
      let prod = await ProductionModel.findOne({ product: productId });
      if (prod) {
        prod.qty += qty;
        await prod.save();
      } else {
        await ProductionModel.create({ product: [productId], qty });
      }
    }

    // ✅ تسجيل Requests كمعتمد
    for (const { productId, qty } of items) {
      await ProductionRequestModel.create({
        product: productId,
        qty,
        approved: true,
      });
    }

    // ✅ تسجيل في History
    await ProductionHistoryModel.create({
      items: items.map(i => ({ product: i.productId, qty: i.qty })),
      action: "approve",
      branch,
      isSend,
      note: "Admin اعتمد العملية مباشرة",
    });
  } else {
    // ✅ المستخدم العادي (طلب فقط)
    for (const { productId, qty } of items) {
      await ProductionRequestModel.create({ product: productId, qty });
    }

    await ProductionHistoryModel.create({
      items: items.map(i => ({ product: i.productId, qty: i.qty })),
      action: "request",
      branch,
      isSend,
      userID,
      note: "تم إرسال طلب في انتظار الاعتماد",
    });
  }

  res.status(200).json({
    message: isAdmin ? "تم الاعتماد وتسجيل العملية" : "تم إرسال الطلب وتسجيله في History",
    status: 200,
    sendHistory,
  });
});


// 🟢 اعتماد مجموعة من الطلبات
exports.approveSelectedProductionRequests = asyncHandler(async (req, res) => {
  const { requestIds } = req.body;

  if (!Array.isArray(requestIds) || requestIds.length === 0) {
    return res.status(400).json({ message: "يجب إرسال قائمة الطلبات المطلوبة للاعتماد" });
  }

  let approvedCount = 0;
  const historyItems = [];

  for (const requestId of requestIds) {
    const request = await ProductionRequestModel.findById(requestId).populate("product");

    if (!request || request.approved) continue;

    let existingProduction = await ProductionModel.findOne({ product: request.product._id });

    if (existingProduction) {
      existingProduction.qty += request.qty;
      await existingProduction.save();
    } else {
      existingProduction = await ProductionModel.create({
        product: [request.product._id],
        qty: request.qty,
      });
    }

    request.approved = true;
    await request.save();
    approvedCount++;

    historyItems.push({ product: request.product._id, qty: request.qty });
  }

  if (historyItems.length > 0) {
    await ProductionHistoryModel.create({
      items: historyItems,
      action: "batch-approve",
      note: "اعتماد مجموعة طلبات",
    });
  }

  res.status(200).json({
    message: `تم اعتماد ${approvedCount} طلب بنجاح`,
    approvedCount,
    status: 200,
  });
});


// 🟢 الطلبات غير المعتمدة
exports.getPendingProductionRequests = asyncHandler(async (req, res) => {
  const requests = await ProductionRequestModel.find({ approved: false })
    .populate({
      path: "product",
      populate: { path: "mainProductOP", select: "name" },
    })
    .populate({
      path: "product",
      populate: { path: "packageUnit", select: "name" },
    });

  res.status(200).json({ data: requests, itemsnumber: requests.length, status: 200 });
});


// 🟢 الإنتاج المعتمد
exports.getApprovedProductions = asyncHandler(async (req, res) => {
  const productions = await ProductionModel.find()
    .populate({
      path: "product",
      populate: { path: "mainProductOP", select: "name" },
    })
    .populate({
      path: "product",
      populate: { path: "packageUnit", select: "name" },
    });

  res.status(200).json({ data: productions, itemsnumber: productions.length, status: 200 });
});


// 🟢 حذف طلب غير معتمد
exports.deletependingrequestByID = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  if (!id) return next(new ApiErrors("حدد ID الطلب", 400));

  const deleted = await ProductionRequestModel.findOneAndDelete({ _id: id });
  if (!deleted) return next(new ApiErrors(`لا يوجد طلب معلق بهذا ID: ${id}`, 404));

  await ProductionHistoryModel.create({
    items: [{ product: deleted.product, qty: deleted.qty }],
    action: "delete-pending",
    note: `حذف طلب معلق ID=${id}`,
  });

  res.status(200).json({ message: "تم حذف الطلب المعلق", status: 200, data: deleted });
});


// 🟢 حذف إنتاج معتمد
exports.deleteaccpetedProductionByID = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  if (!id) return next(new ApiErrors("حدد ID الإنتاج", 400));

  const deleted = await ProductionModel.findOneAndDelete({ _id: id });
  if (!deleted) return next(new ApiErrors(`لا يوجد إنتاج بهذا ID: ${id}`, 404));

  await ProductionHistoryModel.create({
    items: [{ product: deleted.product[0], qty: deleted.qty }],
    action: "delete-production",
    note: `حذف إنتاج ID=${id}`,
  });

  res.status(200).json({ message: "تم حذف الإنتاج", status: 200, data: deleted });
});


// 🟢 تعديل كمية طلب معلق
exports.updatePendingRequestQtyByID = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { qty } = req.body;

  if (!id) return next(new ApiErrors("حدد ID الطلب", 400));
  if (qty === undefined) return next(new ApiErrors("حدد الكمية الجديدة", 400));

  const updated = await ProductionRequestModel.findByIdAndUpdate(
    id,
    { qty },
    { new: true, runValidators: true }
  );

  if (!updated) return next(new ApiErrors(`لا يوجد طلب معلق بهذا ID: ${id}`, 404));

  await ProductionHistoryModel.create({
    items: [{ product: updated.product, qty }],
    action: "update-pending",
    note: `تعديل كمية الطلب المعلق ${id}`,
  });

  res.status(200).json({ message: "تم تعديل الطلب", status: 200, data: updated });
});


// 🟢 تعديل كمية إنتاج معتمد Production
exports.updateProductionQty = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { qty } = req.body;

  if (qty < 0) return res.status(400).json({ message: "الكمية لا يمكن أن تكون سالبة" });

  const updated = await ProductionModel.findByIdAndUpdate(
    id,
    { qty },
    { new: true, runValidators: true }
  );

  if (!updated) return res.status(404).json({ message: "الإنتاج غير موجود" });

  await ProductionHistoryModel.create({
    items: [{ product: updated.product[0], qty }],
    action: "update-production",
    note: `تعديل إنتاج ID=${id}`,
  });

  res.status(200).json({ status: "success", data: updated });
});


// 🟢 تعديل آخر عملية إنتاج لمنتج معين   Production
exports.updateLastProductionByProduct = asyncHandler(async (req, res, next) => {
  const { productId } = req.params;
  const { qty } = req.body;

  if (!productId) return next(new ApiErrors("حدد productId", 400));
  if (qty === undefined || isNaN(qty) || qty < 0) {
    return next(new ApiErrors("حدد كمية صحيحة", 400));
  }

  const lastProduction = await ProductionModel.findOne({ product: productId })
    .sort({ createdAt: -1 });

  if (!lastProduction) return next(new ApiErrors(`لا يوجد إنتاج للمنتج ${productId}`, 404));

  const oldQty = lastProduction.qty;
  lastProduction.qty = qty;
  await lastProduction.save();

  await ProductionHistoryModel.create({
    items: [{ product: productId, qty }],
    action: "update-last",
    note: `تعديل آخر عملية من ${oldQty} إلى ${qty}`,
  });

  res.status(200).json({
    message: "تم تعديل آخر عملية للمنتج",
    status: 200,
    data: lastProduction,
  });
});


// 🟢 حذف عملية من History + خصم تأثيرها من Production
exports.deleteHistoryAndSync = asyncHandler(async (req, res, next) => {
  const { historyId } = req.params;

  const history = await ProductionHistoryModel.findById(historyId);
  if (!history) {
    return next(new ApiErrors("History record not found", 404));
  }

  // خصم الكميات من الإنتاج
  for (const { product, qty } of history.items) {
    let prod = await ProductionModel.findOne({ product });
    if (prod) {
      prod.qty -= qty; // خصم الكمية
      if (prod.qty < 0) prod.qty = 0; // مايسمحش بالسالب
      await prod.save();
    }
  }

  await ProductionHistoryModel.findByIdAndDelete(historyId);

  res.status(200).json({
    message: "تم حذف العملية من History وتحديث Production",
    status: 200,
    deletedHistory: history,
  });
});



// 🟢 عرض كل sendHistory
exports.getAllSendHistory = asyncHandler(async (req, res) => {
  const sendHistory = await SendHistoryModel.find()
    .populate("items.product", "name")
    .populate("branch", "name")
    .populate("userID", "name");

  res.status(200).json({
    data: sendHistory,
    count: sendHistory.length,
    status: 200,
  });
});


exports.deleteSendHistoryById = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  // البحث عن السجل
  const sendHistory = await SendHistoryModel.findById(id);
  if (!sendHistory) {
    return next(new ApiErrors(`لا يوجد سجل SendHistory بهذا ID: ${id}`, 404));
  }

  // 🟡 تسجيل عملية الحذف في ProductionHistory (اختياري لكن مفيد للتتبع)
  // await ProductionHistoryModel.create({
  //   items: sendHistory.items,
  //   action: "delete-send-history",
  //   branch: sendHistory.branch,
  //   isSend: sendHistory.isSend,
  //   note: `تم حذف SendHistory ID=${id}`,
  // });

  // 🗑️ حذف السجل من SendHistory
  await sendHistory.deleteOne();

  res.status(200).json({
    message: "تم حذف سجل SendHistory بنجاح",
    status: 200,
    deletedId: id,
  });
});

exports.updateSendHistory = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { items, status, note, branch, isSend, isAdmin } = req.body;

  // البحث عن السجل
  let sendHistory = await SendHistoryModel.findById(id);
  if (!sendHistory) {
    return next(new ApiErrors(`لا يوجد سجل SendHistory بهذا ID: ${id}`, 404));
  }

  // ✅ تعديل الكميات بالفرق
  if (items && Array.isArray(items)) {
    for (const { product, qty: newQty } of items) {
      const oldItem = sendHistory.items.find(
        (i) => i.product.toString() === product.toString()
      );
      if (oldItem) {
        const diff = newQty - oldItem.qty;
        oldItem.qty += diff;
        if (oldItem.qty < 0) oldItem.qty = 0; // حماية من السالب
      } else {
        // لو المنتج مش موجود في القائمة → أضيفه
        sendHistory.items.push({ product, qty: newQty });
      }
    }
  }

  // ✅ تحديث باقي الحقول
  if (status) sendHistory.status = status;
  if (note) sendHistory.note = note;
  if (branch) sendHistory.branch = branch;
  if (isSend !== undefined) sendHistory.isSend = isSend;
  if (isAdmin !== undefined) sendHistory.isAdmin = isAdmin;

  await sendHistory.save();

  res.status(200).json({
    message: "تم تعديل SendHistory بالفرق وتحديث البيانات",
    status: 200,
    data: sendHistory,
  });
});



exports.exportDetailedExcel = asyncHandler(async (req, res) => {
  // جلب البيانات كاملة مع الفروع والمنتجات
  const records = await ProductionHistoryModel
    .find({})
    .populate("items.product", "name code category") // لو المنتج فيه code أو category
    .populate("branch", "name location") // لو الفرع فيه location
    .sort({ createdAt: -1 });

  // إنشاء ملف Excel جديد
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Production & Supply History");

  // عناوين الأعمدة
  worksheet.columns = [
    { header: "Record ID", key: "_id", width: 24 },
    { header: "Branch Name", key: "branch", width: 20 },
    { header: "Product Name", key: "product", width: 25 },
    { header: "Quantity", key: "qty", width: 10 },
    { header: "Is Send", key: "isSend", width: 10 },
    { header: "Action Type", key: "action", width: 15 },
    { header: "Created At", key: "createdAt", width: 20 },
    { header: "Updated At", key: "updatedAt", width: 20 },
  ];

  // تنسيق العناوين بخط غامق
  worksheet.getRow(1).font = { bold: true };

  // تعبئة الصفوف
  records.forEach((record) => {
    record.items.forEach((item) => {
      worksheet.addRow({
        _id: record._id.toString(),
        branch: record.branch ? record.branch.name : "-",
        product: item.product?.name || "-",
        qty: item.qty,
        isSend: record.isSend ? "نعم" : "لا",
        action: record.action=="approve"?"حديث":"معدل",
        createdAt: record.createdAt.toISOString().slice(0, 19).replace("T", " "),
        updatedAt: record.updatedAt.toISOString().slice(0, 19).replace("T", " "),
      });
    });
  });

  // إعدادات التحميل
  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );
  res.setHeader(
    "Content-Disposition",
    "attachment; filename=production_supply_history.xlsx"
  );

  // إرسال الملف مباشرة
  await workbook.xlsx.write(res);
  res.status(200).end();
});

// 📤 تصدير نفس البيانات إلى Excel
exports.exportTotalQtyToExcel = asyncHandler(async (req, res) => {
  const result = await ProductionModel.aggregate([
    { $unwind: "$product" },
    {
      $group: {
        _id: "$product",
        totalQty: { $sum: "$qty" },
      },
    },
    {
      $lookup: {
        from: "productops",
        localField: "_id",
        foreignField: "_id",
        as: "productDetails",
      },
    },
    { $unwind: { path: "$productDetails", preserveNullAndEmptyArrays: true } },
    {
      $project: {
        productId: "$_id",
        productName: "$productDetails.name",
        totalQty: 1,
      },
    },
  ]);

  // إنشاء ملف Excel
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Total Quantities by Product");

  worksheet.columns = [
    { header: "Product ID", key: "productId", width: 30 },
    { header: "Product Name", key: "productName", width: 25 },
    { header: "Total Quantity", key: "totalQty", width: 15 },
  ];

  worksheet.getRow(1).font = { bold: true };

  result.forEach((r) => {
    worksheet.addRow(r);
  });

  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );
  res.setHeader(
    "Content-Disposition",
    "attachment; filename=total_qty_by_product.xlsx"
  );

  await workbook.xlsx.write(res);
  res.status(200).end();
});
