const { SendProcessHistoryModel } = require("../models/sendProcesModel");
const asyncHandler = require("express-async-handler");
const ApiErrors = require("../utils/apiErrors");
// ✅ جلب جميع العمليات (بالتفاصيل)
exports.getAllSendProcess = asyncHandler(async (req, res, next) => {
  const sendProcessData = await SendProcessHistoryModel.find({})
    .populate("user", "name email") // بيانات المستخدم
    .populate({
      path: "relatedHistory",
      populate: [
        {
          path: "items.product",
          select: "name", // عرض اسم المنتج فقط
        },
        {
          path: "branch", // جلب اسم الفرع من الموديل المرتبط
          select: "name location", // الحقول اللي عايز تعرضها من الفرع
        },
      ],
    })
    .populate("changes.productId", "name") // أسماء المنتجات في التغييرات
    .sort({ createdAt: -1 });

  // ✳️ يمكنك إضافة اسم الفرع مباشرة في المستوى الأعلى (اختياري)
  const formattedData = sendProcessData.map((item) => ({
    ...item.toObject(),
    branch: item.relatedHistory?.branch || null,
  }));

  res.status(200).json({
    status: 200,
    count: formattedData.length,
    data: formattedData,
  });
});

// ✅ حذف عملية معينة
exports.deleteSendProcess = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const deleted = await SendProcessHistoryModel.findByIdAndDelete(id);

  if (!deleted) {
    return next(new ApiErrors(`لا يوجد سجل Process بهذا المعرف: ${id}`, 404));
  }

  res.status(200).json({
    status: 200,
    message: "تم حذف سجل العملية بنجاح ✅",
    deleted,
  });
});
