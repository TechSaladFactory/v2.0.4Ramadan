const asyncHandler = require("express-async-handler");
const { SensitivityMixModel } = require("../models/sensitivityMixModel");
const ApiErrors = require("../utils/ApiErrors"); // تأكد يكون عندك ملف ApiErrors

// GET ALL SensitivityMix مع pagination
exports.getAllSensitivityMix = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page);
  const limit = parseInt(req.query.limit);
  const sort = { _id: -1 };

  let data;

  if (!isNaN(page) && !isNaN(limit) && page > 0 && limit > 0) {
    const skip = (page - 1) * limit;
    data = await SensitivityMixModel.find()
      .populate("p_Mix_primary")
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean();
  } else {
    data = await SensitivityMixModel.find()
      .populate("p_Mix_primary","product")
      .sort(sort)
      .lean();
  }

  res.status(200).json({
    status: 200,
    count: data.length,
    data,
  });
});

// CREATE SensitivityMix
exports.createSensitivityMix = asyncHandler(async (req, res, next) => {
  const { name, p_Mix_primary } = req.body;

  if (name === undefined) {
    return next(new ApiErrors("name is required!", 404));
  } else if (name === "") {
    return next(new ApiErrors("name must not be empty!", 404));
  }

  const mix = await SensitivityMixModel.create({
    name,
    p_Mix_primary,
  });

  res.status(200).json({
    status: 200,
    message: "Sensitivity Mix Created!",
    data: mix,
  });
});

// UPDATE SensitivityMix
exports.updateSensitivityMix = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { name, p_Mix_primary } = req.body;

  if (name === undefined) {
    return next(new ApiErrors("name is required!", 404));
  } else if (name === "") {
    return next(new ApiErrors("name must not be empty!", 404));
  }

  const updatedMix = await SensitivityMixModel.findByIdAndUpdate(
    id,
    { name, p_Mix_primary },
    { new: true, runValidators: true }
  );

  if (!updatedMix) {
    return next(new ApiErrors(`No Sensitivity Mix found for ID: ${id}`, 404));
  }

  res.status(200).json({
    status: 200,
    message: "Sensitivity Mix Updated!",
    data: updatedMix,
  });
});

// DELETE SensitivityMix
exports.deleteSensitivityMix = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const deletedMix = await SensitivityMixModel.findByIdAndDelete(id);

  if (!deletedMix) {
    return next(new ApiErrors(`No Sensitivity Mix found for ID: ${id}`, 404));
  }

  res.status(200).json({
    status: 200,
    message: "Sensitivity Mix Deleted!",
  });
});
