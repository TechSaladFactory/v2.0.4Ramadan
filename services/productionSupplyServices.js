const asyncHandler = require("express-async-handler");
const { productionSupplyModel } = require("../models/ProductionSupplyModel");
const { productOPModel } = require("../models/productOPModel");
const { productionSupplyRequestModel } = require("../models/ProductionSupplyRequestModel");
const { productionSupplyHistoryModel } = require("../models/ProductionSupplyHistoryModel");
const ApiErrors = require("../utils/apiErrors");
const { SendProcessHistoryModel } = require("../models/sendProcesModel");
const ExcelJS = require("exceljs");
const {SendHistoryModel  } = require('../models/sendHistory');


// 🟢 تعديل عملية في History + Sync مع ProductionSupply (بالفرق)

// exports.updateHistoryAndSync = asyncHandler(async (req, res, next) => {
//   const { historyId } = req.params;
//   const { items, userId, note, locationProcess } = req.body;

//   // ✅ جلب سجل History
//   const history = await productionSupplyHistoryModel.findById(historyId);
//   if (!history) {
//     return next(new ApiErrors("History record not found", 404));
//   }

//   // ✅ ضمان أن items Array
//   if (!Array.isArray(history.items)) {
//     history.items = [];
//   }

//   const changesLog = [];

//   // ✅ تعديل الكميات بالفرق + حفظ تفاصيل التغيير
//   for (const { product, qty: newQty } of items) {
//     const oldItem = history.items.find(
//       (i) => i.product.toString() === product.toString()
//     );
//     const oldQty = oldItem ? oldItem.qty : 0;
//     const diff = newQty - oldQty;

//     // نجيب المنتج من جدول الإنتاج
//     let prod = await productionSupplyModel.findOne({ product });
//     if (!prod) {
//       return next(
//         new ApiErrors(`المنتج ${product} غير موجود في ProductionSupply`, 400)
//       );
//     }

//     prod.qty += diff;
//     if (prod.qty < 0) prod.qty = 0;
//     await prod.save();

//     // نجيب اسم المنتج من جدول المنتجات (اختياري)
//     const productData = await productOPModel.findById(product).select("name");

//     // نسجل تفاصيل التعديل
//     changesLog.push({
//       productId: product,
//       productName: productData ? productData.name : "غير معروف",
//       oldQty,
//       newQty,
//       diff,
//     });
//   }

//   // ✅ تحديث سجل History نفسه
//   history.items = items;
//   history.action = "update";
//   await history.save();

//   // ✅ إنشاء سجل في ProcessHistory لتوثيق التغيير
//   await ProcessHistoryModel.create({
//     user: userId,
//     typeProcess: "update",
//     note: note || "تعديل كميات الإمداد",
//     relatedHistory: history._id,
//     modelType: "ProductionSupplyHistory",
//     locationProcess: locationProcess || "Supply Section",
//     changes: changesLog,
//   });

//   // ✅ إرجاع النتيجة
//   res.status(200).json({
//     message: "تم تعديل الكميات وتحديث ProductionSupply وتسجيل التفاصيل",
//     status: 200,
//     data: {
//       history,
//       changes: changesLog,
//     },
//   });
// });


exports.updateHistoryAndSync = asyncHandler(async (req, res, next) => {
  const { historyId } = req.params;
  const { items, userId, note, locationProcess } = req.body;

  const history = await productionSupplyHistoryModel.findById(historyId);
  if (!history) {
    return next(new ApiErrors("History record not found", 404));
  }

  const changesLog = [];

  for (const { product, qty: newQty } of items) {
    const oldItem = history.items.find(
      (i) => i.product.toString() === product.toString()
    );

    const oldQty = oldItem ? oldItem.qty : 0;
    const diff = newQty - oldQty;

    // 🔹 الحصول على المنتج من الإنتاج أو إنشاؤه تلقائيًا
    let prod = await productionSupplyModel.findOne({ product });

    if (!prod) {
      prod = await productionSupplyModel.create({
        product,
        qty: 0,
      });
    }

    prod.qty += diff;
    if (prod.qty < 0) prod.qty = 0;
    await prod.save();

    const productData = await productOPModel
      .findById(product)
      .select("name");

    changesLog.push({
      productId: product,
      productName: productData?.name || "غير معروف",
      oldQty,
      newQty,
      diff,
    });
  }

  history.items = items;
  history.action = "update";
  await history.save();

  await SendProcessHistoryModel.create({
    user: userId,
    typeProcess: "update",
    note: note || "تعديل كميات الإنتاج",
    relatedHistory: history._id,
    modelType: "ProductionSupplyHistory",
    locationProcess: locationProcess || "Production Section",
    changes: changesLog,
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
// 🟢 عرض كل History (Pagination اختيارية وسريعة)
exports.getAllHistory = asyncHandler(async (req, res) => {
  const { page, limit } = req.query;

  let query = productionSupplyHistoryModel
    .find()
    .sort({ createdAt: -1 }) // مهم جداً للسرعة مع index
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
    .lean(); // 🔥 أسرع بكتير

  let total = await productionSupplyHistoryModel.countDocuments();

  // ✅ لو pagination موجودة فقط
  if (page && limit) {
    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);
    const skip = (pageNumber - 1) * limitNumber;

    query = query.skip(skip).limit(limitNumber);
  }

  const history = await query;

  res.status(200).json({
    data: history,
    totalItems: total,
    currentPage: page ? parseInt(page) : null,
    totalPages: page && limit ? Math.ceil(total / parseInt(limit)) : null,
    status: 200,
  });
});




// 🟢 إرسال طلب إنتاج (User أو Admin)
exports.sendProductionSupplyRequests = asyncHandler(async (req, res) => {
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
    sendType:"توريد"
  });

  if (isAdmin) {
    // ✅ تحديث ProductionSupply
    for (const { productId, qty } of items) {
      let prod = await productionSupplyModel.findOne({ product: productId });
      if (prod) {
        prod.qty += qty;
        await prod.save();
      } else {
        await productionSupplyModel.create({ product: [productId], qty });
      }
    }

    // ✅ تسجيل Requests كمعتمد
    for (const { productId, qty } of items) {
      await productionSupplyRequestModel.create({
        product: productId,
        qty,
        approved: true,
      });
    }

    // ✅ تسجيل في History
    await productionSupplyHistoryModel.create({
      items: items.map(i => ({ product: i.productId, qty: i.qty })),
      action: "approve",
      branch,
      isSend,
      note: "Admin اعتمد العملية مباشرة",
    });
  } else {
    // ✅ المستخدم العادي (طلب فقط)
    for (const { productId, qty } of items) {
      await productionSupplyRequestModel.create({ product: productId, qty });
    }

    await productionSupplyHistoryModel.create({
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
exports.approveSelectedProductionSupplyRequests = asyncHandler(async (req, res) => {
  const { requestIds } = req.body;

  if (!Array.isArray(requestIds) || requestIds.length === 0) {
    return res.status(400).json({ message: "يجب إرسال قائمة الطلبات المطلوبة للاعتماد" });
  }

  let approvedCount = 0;
  const historyItems = [];

  for (const requestId of requestIds) {
    const request = await productionSupplyRequestModel.findById(requestId).populate("product");

    if (!request || request.approved) continue;

    let existingProductionSupply = await productionSupplyModel.findOne({ product: request.product._id });

    if (existingProductionSupply) {
      existingProductionSupply.qty += request.qty;
      await existingProductionSupply.save();
    } else {
      existingProductionSupply = await productionSupplyModel.create({
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
    await productionSupplyHistoryModel.create({
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
exports.getPendingProductionSupplyRequests = asyncHandler(async (req, res) => {
  const requests = await productionSupplyRequestModel.find({ approved: false })
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
exports.getApprovedProductionSupplys = asyncHandler(async (req, res) => {
  const ProductionSupplys = await productionSupplyModel.find()
    .populate({
      path: "product",
      populate: { path: "mainProductOP", select: "name" },
    })
    .populate({
      path: "product",
      populate: { path: "packageUnit", select: "name" },
    });

  res.status(200).json({ data: ProductionSupplys, itemsnumber: ProductionSupplys.length, status: 200 });
});


// 🟢 حذف طلب غير معتمد
exports.deletependingrequestByID = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  if (!id) return next(new ApiErrors("حدد ID الطلب", 400));

  const deleted = await productionSupplyRequestModel.findOneAndDelete({ _id: id });
  if (!deleted) return next(new ApiErrors(`لا يوجد طلب معلق بهذا ID: ${id}`, 404));

  await productionSupplyHistoryModel.create({
    items: [{ product: deleted.product, qty: deleted.qty }],
    action: "delete-pending",
    note: `حذف طلب معلق ID=${id}`,
  });

  res.status(200).json({ message: "تم حذف الطلب المعلق", status: 200, data: deleted });
});


// 🟢 حذف إنتاج معتمد
exports.deleteaccpetedProductionSupplyByID = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  if (!id) return next(new ApiErrors("حدد ID الإنتاج", 400));

  const deleted = await productionSupplyModel.findOneAndDelete({ _id: id });
  if (!deleted) return next(new ApiErrors(`لا يوجد إنتاج بهذا ID: ${id}`, 404));

  await productionSupplyHistoryModel.create({
    items: [{ product: deleted.product[0], qty: deleted.qty }],
    action: "delete-ProductionSupply",
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

  const updated = await productionSupplyRequestModel.findByIdAndUpdate(
    id,
    { qty },
    { new: true, runValidators: true }
  );

  if (!updated) return next(new ApiErrors(`لا يوجد طلب معلق بهذا ID: ${id}`, 404));

  await productionSupplyHistoryModel.create({
    items: [{ product: updated.product, qty }],
    action: "update-pending",
    note: `تعديل كمية الطلب المعلق ${id}`,
  });

  res.status(200).json({ message: "تم تعديل الطلب", status: 200, data: updated });
});


// 🟢 تعديل كمية إنتاج معتمد
exports.updateProductionSupplyQty = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { qty } = req.body;

  if (qty < 0) return res.status(400).json({ message: "الكمية لا يمكن أن تكون سالبة" });

  const updated = await productionSupplyModel.findByIdAndUpdate(
    id,
    { qty },
    { new: true, runValidators: true }
  );

  if (!updated) return res.status(404).json({ message: "الإنتاج غير موجود" });

  await productionSupplyHistoryModel.create({
    items: [{ product: updated.product[0], qty }],
    action: "update-ProductionSupply",
    note: `تعديل إنتاج ID=${id}`,
  });

  res.status(200).json({ status: "success", data: updated });
});


// 🟢 تعديل آخر عملية إنتاج لمنتج معين
exports.updateLastProductionSupplyByProduct = asyncHandler(async (req, res, next) => {
  const { productId } = req.params;
  const { qty } = req.body;

  if (!productId) return next(new ApiErrors("حدد productId", 400));
  if (qty === undefined || isNaN(qty) || qty < 0) {
    return next(new ApiErrors("حدد كمية صحيحة", 400));
  }

  const lastProductionSupply = await productionSupplyModel.findOne({ product: productId })
    .sort({ createdAt: -1 });

  if (!lastProductionSupply) return next(new ApiErrors(`لا يوجد إنتاج للمنتج ${productId}`, 404));

  const oldQty = lastProductionSupply.qty;
  lastProductionSupply.qty = qty;
  await lastProductionSupply.save();

  await productionSupplyHistoryModel.create({
    items: [{ product: productId, qty }],
    action: "update-last",
    note: `تعديل آخر عملية من ${oldQty} إلى ${qty}`,
  });

  res.status(200).json({
    message: "تم تعديل آخر عملية للمنتج",
    status: 200,
    data: lastProductionSupply,
  });
});


// 🟢 حذف عملية من History + خصم تأثيرها من ProductionSupply
exports.deleteHistoryAndSync = asyncHandler(async (req, res, next) => {
  const { historyId } = req.params;

  const history = await productionSupplyHistoryModel.findById(historyId);
  if (!history) {
    return next(new ApiErrors("History record not found", 404));
  }

  if (!Array.isArray(history.items)) {
    history.items = [];
  }

  // خصم الكميات من الإنتاج
  for (const { product, qty } of history.items) {
    let prod = await productionSupplyModel.findOne({ product });
    if (prod) {
      prod.qty -= qty;
      if (prod.qty < 0) prod.qty = 0;
      await prod.save();
    }
  }

  await productionSupplyHistoryModel.findByIdAndDelete(historyId);

  res.status(200).json({
    message: "تم حذف العملية من History وتحديث ProductionSupply",
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

  const sendHistory = await SendHistoryModel.findById(id);
  if (!sendHistory) {
    return next(new ApiErrors(`لا يوجد سجل SendHistory بهذا ID: ${id}`, 404));
  }

  // await productionSupplyHistoryModel.create({
  //   items: sendHistory.items,
  //   action: "delete-send-history",
  //   branch: sendHistory.branch,
  //   isSend: sendHistory.isSend,
  //   note: `تم حذف SendHistory ID=${id}`,
  // });

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

  let sendHistory = await SendHistoryModel.findById(id);
  if (!sendHistory) {
    return next(new ApiErrors(`لا يوجد سجل SendHistory بهذا ID: ${id}`, 404));
  }

  if (!Array.isArray(sendHistory.items)) {
    sendHistory.items = [];
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
        if (oldItem.qty < 0) oldItem.qty = 0;
      } else {
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
  const records = await productionSupplyHistoryModel
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
