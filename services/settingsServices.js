const asyncHandler = require("express-async-handler");
const ApiErrors = require("../utils/apiErrors");
const { settingsModel } = require("../models/settingsModel");


// ✅ Get all settings (كل الرولز)
exports.getAllSettings = asyncHandler(async (req, res, next) => {
    const settings = await settingsModel.find();
  
    res.status(200).json({
      status: "success",
      results: settings.length,
      data: settings,
    });
  });
  
  // ✅ Get one setting by id (رول واحدة)
  exports.getSettingById = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
  
    const setting = await settingsModel.findById(id);
  
    if (!setting) {
      return next(new ApiErrors(`No setting found with id: ${id}`, 404));
    }
  
    res.status(200).json({
      status: "success",
      data: setting,
    });
  });
  

// ✅ إنشاء رول جديدة
exports.createSetting = asyncHandler(async (req, res, next) => {
  const { name, des, open } = req.body;

  if (!name || !des) {
    return next(new ApiErrors("name & des are required", 400));
  }

  const setting = await settingsModel.create({ name, des, open });

  res.status(201).json({
    status: "success",
    message: "Setting created successfully",
    data: setting,
  });
});

// ✅ تعديل رول موجودة
exports.updateSetting = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { name, des, open } = req.body;

  const updated = await settingsModel.findByIdAndUpdate(
    id,
    { name, des, open },
    { new: true, runValidators: true }
  );

  if (!updated) {
    return next(new ApiErrors(`No setting found with id: ${id}`, 404));
  }

  res.status(200).json({
    status: "success",
    message: "Setting updated successfully",
    data: updated,
  });
});

// ✅ حذف رول
exports.deleteSetting = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
  
    const deleted = await settingsModel.findByIdAndDelete(id);
  
    if (!deleted) {
      return next(new ApiErrors(`No setting found with id: ${id}`, 404));
    }
  
    res.status(200).json({
      status: "success",
      message: "Setting deleted successfully",
    });
  });
  

//use for edite after 30 min orderSupply=Production
exports.startCountdown = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { start } = req.body;

  const setting = await settingsModel.findById(id);
  if (!setting) {
    return next(new ApiErrors(`No setting found with id: ${id}`, 404));
  }

  // لو start = true نبدأ العد
  if (start === true) {
    // أولاً نخلي open = true
    setting.open = true;
    await setting.save();

    // نبدأ تايمر 50 ثانية = 50000 ملي ثانية
    setTimeout(async () => {
      const current = await settingsModel.findById(id);
      if (current && current.open === true) {
        current.open = false;
        await current.save();
        console.log(`⏰ Countdown finished for ${id}, set open=false`);
      }
    }, 30 * 60 * 1000); // ✅ 50 ثانية فقط

    return res.status(200).json({
      status: "success",
      message: "Countdown started for 50 seconds.",
      data: setting,
    });
  } else {
    // لو start = false نوقفها يدويًا
    setting.open = false;
    await setting.save();

    return res.status(200).json({
      status: "success",
      message: "Countdown stopped manually.",
      data: setting,
    });
  }
});
