const asyncHandler = require("express-async-handler");
const Mix = require("../models/mixedModel");
const { MixproductModel } = require("../models/mixProduct");
const { default: slugify } = require("slugify");

// @desc    Create a new Mix
// @route   POST /mixes
// @access  Public
exports.createMix = asyncHandler(async (req, res) => {
  const { name, productMixed ,note} = req.body;
  const newMix = await Mix.create({ name, productMixed,note });
  res.status(200).json(newMix);
});

// @desc    Get all Mixes
// @route   GET /mixes
// @access  Public




exports.getAllMixes = asyncHandler(async (req, res) => {
  // جلب كل المزيجات مع بيانات المنتجات المدمجة
  const mixes = await Mix.find().populate("productMixed.product");

  const result = [];
  const bulkOperations = [];

  for (const mix of mixes) {
    let totalCalory = 0;
    let totalCarpo = 0;
    let totalProtein = 0;
    let totalFat = 0;
    let totalAlyaf = 0;
    let totalQty = 0;

    for (const item of mix.productMixed) {
      if (!item.product) continue; // تجاهل العناصر بدون منتج

      const qty = item.Qty || 0;
      totalQty += qty;

      totalCalory += (item.product.caloryfor1gram || 0) * qty;
      totalCarpo += (item.product.carpoPerGram || 0) * qty;
      totalProtein += (item.product.proteinPerGram || 0) * qty;
      totalFat += (item.product.fatPerGram || 0) * qty;
      totalAlyaf += (item.product.alyafPerGram || 0) * qty;
    }

    // تحديث أو إدخال جديد في MixproductModel باستخدام upsert
    bulkOperations.push({
      updateOne: {
        filter: { product: mix.name }, // يطابق على اسم الـ mix
        update: {
          $set: {
            slug: slugify(mix.name),
            carpo: totalCarpo,
            brotten: totalProtein,
            dohon: totalFat,
            qty: totalQty,
            alyaf: totalAlyaf,
                        isKalta:true,

            calory: totalCalory,
          },
        },
        upsert: true, // إذا لم يكن موجودًا، يتم إنشاء سجل جديد
      },
    });

    // إضافة البيانات النهائية للرد
    result.push({
      ...mix.toObject(),
      totalCalory,
      totalCarpo,
      totalProtein,
      totalFat,
      totalAlyaf,
      totalQty,
    });
  }

  // تنفيذ كل العمليات دفعة واحدة لتحسين الأداء
  if (bulkOperations.length > 0) {
    await MixproductModel.bulkWrite(bulkOperations);
  }

  res.status(200).json({ data: result, status: 200 });
});





// exports.getAllMixes  = asyncHandler(async (req, res) => {
//   const mixes = await Mix.find().populate("productMixed.product");

//   const result = mixes.map(mix => {
//     let totalCalory = 0;
//     let totalCarpo = 0;
//     let totalProtein = 0;
//     let totalFat = 0;
//     let totalalyaf = 0;

//     const productMixed = mix.productMixed.map(item => {
//       const calory = (item.product?.caloryfor1gram || 0) * (item.Qty || 0);
//       const carpo = (item.product?.carpoPerGram || 0) * (item.Qty || 0);
//       const protein = (item.product?.proteinPerGram || 0) * (item.Qty || 0);
//       const fat = (item.product?.fatPerGram || 0) * (item.Qty || 0);
//       const alyaf = (item.product?.alyafPerGram || 0) * (item.Qty || 0);

//       totalCalory += calory;
//       totalCarpo += carpo;
//       totalProtein += protein;
//       totalFat += fat;
// totalalyaf +=alyaf;
//       return {
//         ...item.toObject(),
//         calory,
//         carpo,
//         protein,
//         fat,
//         alyaf
//       };
//     });

//     return {
//       ...mix.toObject(),
//       productMixed,
//       totalCalory,
//       totalCarpo,
//       totalProtein,
      
//       totalFat,
//       totalalyaf
//     };
//   });

//   res.status(200).json({ data: result, status: 200 });
// });


// @desc    Get Mix by ID
// @route   GET /mixes/:id
// @access  Public
exports.getMixById = asyncHandler(async (req, res) => {
  const mix = await Mix.findById(req.params.id).populate("productMixed.product");
  if (!mix) return res.status(404).json({ message: "Mix not found" });
  res.status(200).json(mix);
});

// @desc    Update Mix
// @route   PUT /mixes/:id
// @access  Public
exports.updateMix = asyncHandler(async (req, res) => {

  const oldMix = await Mix.findById(req.params.id);
  if (!oldMix) {
    res.status(404);
    throw new Error("Mix not found");
  }

  const updatedMix = await Mix.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  ).populate("productMixed.product");

  let totalCalory = 0, totalCarpo = 0, totalProtein = 0,
      totalFat = 0, totalAlyaf = 0, totalQty = 0;

  for (const item of updatedMix.productMixed) {
    if (!item.product) continue;
    const qty = item.Qty || 0;
    totalQty += qty;
    totalCalory += (item.product.caloryfor1gram || 0) * qty;
    totalCarpo += (item.product.carpoPerGram || 0) * qty;
    totalProtein += (item.product.proteinPerGram || 0) * qty;
    totalFat += (item.product.fatPerGram || 0) * qty;
    totalAlyaf += (item.product.alyafPerGram || 0) * qty;
  }

  // ✅ update using OLD name
  await MixproductModel.findOneAndUpdate(
    { product: oldMix.name },
    {
      product: updatedMix.name,
      slug: slugify(updatedMix.name),
      carpo: totalCarpo,
      brotten: totalProtein,
      dohon: totalFat,
      qty: totalQty,
      alyaf: totalAlyaf,
      calory: totalCalory,
      isKalta: true,
    },
    { new: true }
  );

  res.status(200).json({ status: 200, data: updatedMix });
});


// @desc    Delete Mix
// @route   DELETE /mixes/:id
// @access  Public
exports.deleteMix = asyncHandler(async (req, res) => {
  const deletedMix = await Mix.findByIdAndDelete(req.params.id);
  if (!deletedMix) return res.status(404).json({ message: "Mix not found" });

  const mixName =await MixproductModel.find({
    product:deletedMix.name
  })
await MixproductModel.findOneAndDelete({product:deletedMix.name})

  res.status(200).json({ message: "Mix deleted successfully",  data:deletedMix ,refind:mixName},
  );
});




