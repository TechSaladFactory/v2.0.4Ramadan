const { default: slugify } = require("slugify");
const { MixproductModel } = require("../models/mixProduct");
const asyncHandler = require("express-async-handler");
const ApiErrors = require("../utils/apiErrors");
const Mix = require("../models/mixedModel");

//getAllProductWithMixed 
exports.getAllProductWithMixed = asyncHandler(async (req, res) => {
  // Get all MixProducts with populated unit
  const allMixproduct = await MixproductModel.find().populate("unit", "name");

  // Get all Mixes with populated productMixed.product
  const mixes = await Mix.find().populate("productMixed.product");

  // Calculate totals for each Mix (like in your getAllMixes function)
  const resultMixes = mixes.map(mix => {
    let totalCalory = 0;
    let totalCarpo = 0;
    let totalProtein = 0;
    let totalFat = 0;
    let totalAlyaf = 0;

    const productMixed = mix.productMixed.map(item => {
      const calory = (item.product?.caloryfor1gram || 0) * (item.Qty || 0);
      const carpo = (item.product?.carpoPerGram || 0) * (item.Qty || 0);
      const protein = (item.product?.proteinPerGram || 0) * (item.Qty || 0);
      const fat = (item.product?.fatPerGram || 0) * (item.Qty || 0);
      const alyaf = (item.product?.alyafPerGram || 0) * (item.Qty || 0);

      totalCalory += calory;
      totalCarpo += carpo;
      totalProtein += protein;
      totalFat += fat;
      totalAlyaf += alyaf;

      return {
        ...item.toObject(),
        calory,
        carpo,
        protein,
        fat,
        alyaf
      };
    });

    return {
      ...mix.toObject(),
      productMixed,
      totalCalory,
      totalCarpo,
      totalProtein,
      totalFat,
      totalAlyaf
    };
  });

  res.status(200).json({
    mixProducts: allMixproduct,
    mixes: resultMixes,
    mixProductCount: allMixproduct.length,
    mixCount: resultMixes.length,
    status: 200,
  });
});



// Get All MixProducts
exports.getMixproduct = asyncHandler(async (req, res) => {
  const allMixproduct = await MixproductModel.find().populate("unit","name");
  res.status(200).json({
    data: allMixproduct,
    itemsnumber: allMixproduct.length,
    status: 200,
  });
});


// Add New MixProduct
exports.addMixproduct = asyncHandler(async (req, res, next) => {
  const { product, unit, carpo, brotten, dohon, qty, alyaf,calory ,note} = req.body;

  if (!product || product.trim() === "") {
    return next(new ApiErrors("Product name is required!", 400));
  }
  const existing = await MixproductModel.findOne({ product });
  if (existing) return next(new ApiErrors("MixProduct already exists!", 400));

  const newMixproduct = await MixproductModel.create({
    product,
    slug: slugify(product),
    unit,
    carpo,
    brotten,
    dohon,
    qty,
    alyaf,
    calory ,
  note  });

  res.status(201).json({
    data: newMixproduct,
    message: "MixProduct added successfully!",
    status: 200,
  });
});

// Update MixProduct By ID
exports.updateMixproductByID = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { product, unit, carpo, brotten, dohon, qty, alyaf,calory ,note} = req.body;

  if (!product || product.trim() === "") {
    return next(new ApiErrors("Product name is required!", 400));
  }

  const updated = await MixproductModel.findByIdAndUpdate(
    id,
    { product, slug: slugify(product), unit, carpo, brotten, dohon, qty, alyaf, calory ,note},
    { new: true, runValidators: true }
  );

  if (!updated) return next(new ApiErrors(`No MixProduct found for ID: ${id}`, 404));

  res.status(200).json({
    data: updated,
    message: "MixProduct updated successfully!",
    status: 200,
  });
});

// Delete MixProduct By ID
exports.deleteMixproductByID = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const deleted = await MixproductModel.findByIdAndDelete(id);

  if (!deleted) return next(new ApiErrors(`No MixProduct found for ID: ${id}`, 404));

  res.status(200).json({
    data: deleted,
    message: "MixProduct deleted successfully!",
    status: 200,
  });
});
