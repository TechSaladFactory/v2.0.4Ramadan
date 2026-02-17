const asyncHandler = require('express-async-handler');
const { FailedLoginModel } = require("../models/failedLoginModel");
const ApiErrors = require("../utils/apiErrors");
// GET: جميع سجلات محاولات الفشل
exports.getAllFailedLogins = asyncHandler(async (req, res, next) => {
  const records = await FailedLoginModel.find();

  res.status(200).json({
    data: records,
    count: records.length,
    status: 200,
  });
});

// DELETE: حذف سجل محدد باستخدام _id
exports.deleteFailedLoginById = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const record = await FailedLoginModel.findByIdAndDelete(id);

  if (!record) {
    return next(new ApiErrors("Record Devivces not found", 404));
  }

  res.status(200).json({
    message: "Record deleted successfully",
    status: 200,
  });
});

//control

exports.controlBlockDevices = asyncHandler(async (req, res, next) => {
  const { isBlocked } = req.body;
  const id = req.params.id;

  if (isBlocked === undefined || isBlocked === "") {
    return next(new ApiErrors(`isBlocked is required`, 400));
  }

  const Device = await FailedLoginModel.findOneAndUpdate(
    { _id: id },
    { isBlocked },
    { new: true }
  );

  if (!Device) {
    return next(new ApiErrors(`No Device found for this ID: ${id}!`, 404));
  }

  const value =
  isBlocked === true
      ? "U can login"
      : "U can not login";

  res.status(200).json({ message: value, status: 200 });
});
