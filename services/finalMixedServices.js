const asyncHandler = require("express-async-handler");
const finalMixedModel = require("../models/finalMixedModel");
const { MixproductModel } = require("../models/mixProduct");
const { default: slugify } = require("slugify");

// @desc    Create a new Mix
// @route   POST /mixes
// @access  Public
exports.createfinalMix = asyncHandler(async (req, res) => {
  const { name, productMixed } = req.body;
  const newMix = await finalMixedModel.create({ name, productMixed });
  res.status(200).json(newMix);
});

// @desc    Get all Mixes
// @route   GET /mixes
// @access  Public
exports.getAllfinalMixes = asyncHandler(async (req, res) => {
  const mixes = await finalMixedModel
    .find()
    .populate("productMixed.product");

  const result = [];

  for (const mix of mixes) {
    let totalCalory = 0;
    let totalCarpo = 0;
    let totalProtein = 0;
    let totalFat = 0;
    let totalAlyaf = 0;

    for (const item of mix.productMixed) {
      if (!item.product) continue;

      const qty =
        Number(item.Qty) ||   // 🔥 هنا كان الخطأ
        Number(item.qty) ||
        Number(item.gram) ||
        Number(item.weight) ||
        Number(item.quantity) ||
        0;

      totalCalory  += (item.product.caloryfor1gram  || 0) * qty;
      totalCarpo   += (item.product.carpoPerGram    || 0) * qty;
      totalProtein += (item.product.proteinPerGram  || 0) * qty;
      totalFat     += (item.product.fatPerGram      || 0) * qty;
      totalAlyaf   += (item.product.alyafPerGram    || 0) * qty;
    }

    result.push({
      ...mix.toObject(),
      totalCalory,
      totalCarpo,
      totalProtein,
      totalFat,
      totalAlyaf,
    });
  }

  res.status(200).json({
    status: 200,
    data: result,
  });
});


// @desc    Get Mix by ID
// @route   GET /mixes/:id
// @access  Public
exports.getfinalMixById = asyncHandler(async (req, res) => {
  const mix = await finalMixedModel.findById(req.params.id).populate("productMixed.product");
  if (!mix) return res.status(404).json({ message: "finalMixed not found" });
  res.status(200).json(mix);
});

// @desc    Update Mix
// @route   PUT /mixes/:id
// @access  Public
exports.updatefinalMix = asyncHandler(async (req, res) => {
  const updatedMix = await finalMixedModel.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );

  if (!updatedMix) {
    res.status(404);
    throw new Error("finalMixed not found");
  }

  res.status(200).json({
    status: 200,
    data: updatedMix,
  });
});

// @desc    Delete Mix
// @route   DELETE /mixes/:id
// @access  Public
exports.deletefinalMix = asyncHandler(async (req, res) => {
  const deletedMix = await finalMixedModel.findByIdAndDelete(req.params.id);
  if (!deletedMix) return res.status(404).json({ message: "finalMixed not found" });

  res.status(200).json({ message: "finalMixed deleted successfully",  data:deletedMix },
  );
});


