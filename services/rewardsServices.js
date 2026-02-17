const { default: slugify } = require("slugify");
const  RewardsModel  = require("../models/rewardsModel");
const asyncHandler = require("express-async-handler");
const ApiErrors = require("../utils/apiErrors");
const searchByname = require("../utils/searchBykeyword");
const { uploadImage } = require("../utils/imageUploadedtoCloudinary");
const mongoose = require("mongoose");

// ==========================
// Get All Rewards
// GET /api/reedem/getAll
// ==========================
exports.getreedem = asyncHandler(async (req, res) => {
  const filter = searchByname(req.query);

  const page = req.query.page ? parseInt(req.query.page) : null;
  const limit = req.query.limit ? parseInt(req.query.limit) : null;

  let query = RewardsModel.find(filter)
    .populate({ path: "categories.category", select: "name" })
    .populate({ path: "departments", populate: { path: "department" } });

  // pagination لو موجودة
  if (page && limit) {
    const skip = (page - 1) * limit;
    query = query.skip(skip).limit(limit);
  }

  const allReedem = await query.lean();

  // لو عايز عدد العناصر الكلي (مش بالpagination)
  const total = await RewardsModel.countDocuments(filter);

  res.status(200).json({
    data: allReedem,
    currentPage: page || 1,
    totalPages: limit ? Math.ceil(total / limit) : 1,
    totalItems: total,
    itemsPerPage: limit || total,
    status: 200,
  });
});


// ==========================
// Get Reward By ID
// GET /api/reedem/:id
// ==========================
exports.getSpecialreedemByid = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const reedemById = await RewardsModel.findById(id)
    .populate({ path: "categories.category", select: "name" });

  if (!reedemById) {
    return next(new ApiErrors(`No reward found for this ID: ${id} !`, 404));
  }

  res.status(200).json({ data: reedemById, status: 200 });
});

// ==========================
// Create New Reward
// POST /api/reedem/addreedem
// ==========================



exports.addreedem = asyncHandler(async (req, res, next) => {
  let { title, des, categories, departments } = req.body;

  if (!title) return next(new ApiErrors("Reward title required!", 400));

  if (typeof categories === "string") {
    try {
      categories = JSON.parse(categories);
    } catch (e) {
      return next(new ApiErrors("Invalid categories format", 400));
    }
  }

  if (typeof departments === "string") {
    try {
      departments = JSON.parse(departments);
    } catch (e) {
      return next(new ApiErrors("Invalid departments format", 400));
    }
  }

  if (!categories || categories.length === 0)
    return next(new ApiErrors("At least one category is required!", 400));

  if (!departments || departments.length === 0)
    return next(new ApiErrors("At least one department is required!", 400));

  let image;
  try {
    image = await uploadImage(req, "redeemPhoto");
  } catch (err) {
    console.error("Image upload error:", err.message);
  }

  const newReward = await RewardsModel.create({
    title,
    des,
    categories,
    departments,
    ...(image && { image }),
  });

  return res.status(201).json({
    data: newReward,
    message: "Reward added successfully!",
    status: 201,
  });
});


// ==========================
// Update Reward By ID
// PUT /api/reedem/:id
// ==========================

exports.updatereedemByID = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  let { title, des, categories, departments } = req.body;

  if (!title) return next(new ApiErrors("Reward title required!", 400));
  if (!categories) return next(new ApiErrors("At least one category is required!", 400));

  if (typeof categories === "string") {
    try {
      categories = JSON.parse(categories);
    } catch (e) {
      return next(new ApiErrors("Invalid categories format", 400));
    }
  }

  if (!Array.isArray(categories) || categories.length === 0)
    return next(new ApiErrors("At least one category is required!", 400));

  if (departments && typeof departments === "string") {
    try {
      departments = JSON.parse(departments);
    } catch (e) {
      return next(new ApiErrors("Invalid departments format", 400));
    }
  }

  if (departments && !Array.isArray(departments))
    return next(new ApiErrors("Departments must be an array", 400));

  // image
  let image;
  try {
    image = await uploadImage(req, "redeemPhoto");
  } catch (err) {
    image = undefined;
  }

  const updateData = {
    title,
    des,
    categories,
    ...(departments && { departments }),
    ...(image && { image }),
  };

  const updatedReward = await RewardsModel.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  });

  if (!updatedReward)
    return next(new ApiErrors(`No reward found for ID: ${id}`, 404));

  res.status(200).json({
    message: "Reward updated successfully!",
    status: 200,
    data: updatedReward,
  });
});

// ==========================
// Delete Reward By ID
// DELETE /api/reedem/:id
// ==========================
exports.deletereedemByID = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  if (!id) return next(new ApiErrors("Reward ID is required!", 400));

  const deletedReward = await RewardsModel.findByIdAndDelete(id);

  if (!deletedReward) return next(new ApiErrors(`No reward found for ID: ${id}`, 404));

  res.status(200).json({
    message: "Reward deleted successfully!",
    status: 200,
    data: deletedReward,
  });
});

// ==========================
// Get All Rewards By Category ID
// GET /api/reedem/cat/:id
// ==========================
exports.getAllRewardsByCategoryID = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const rewards = await RewardsModel.find({ "categories.category": id })
    .populate({ path: "categories.category"});

  res.status(200).json({
    data: rewards,
    itemsnumber: rewards.length,
    status: 200,
  });
});

// ==========================
// Get All Rewards By Depart ID
// GET /api/reedem/depart/:id
// ==========================
exports.getAllRewardsByDepartmentID = asyncHandler(async (req, res) => {
  const { departmentId } = req.params;

  const rewards = await RewardsModel.find({
    "categories.category.departments": departmentId
  })
    .populate({
      path: "categories.category",
      populate: { path: "departments" } 
    });

  res.status(200).json({
    data: rewards,
    itemsnumber: rewards.length,
    status: 200,
  });
});

exports.makeRewardsShow = asyncHandler(async (req, res, next) => {
  const {departmentId, display} = req.body;
  const {id} =req.params
  if (!id || !departmentId)
    return next(new ApiErrors("rewardId and departmentId are required!", 400));

  // افتراضي لو ما اتبعتش قيمة display
  const displayValue = typeof display === "boolean" ? display : true;

  const reward = await RewardsModel.findById(id);
  if (!reward) return next(new ApiErrors(`No reward found for ID: ${id}`, 404));

  const deptIndex = reward.departments.findIndex(
    (d) => d.department.toString() === departmentId
  );

  if (deptIndex === -1) {
    return next(new ApiErrors(`No department found with ID: ${departmentId}`, 404));
  }

  reward.departments[deptIndex].display = displayValue;

  await reward.save();

  res.status(200).json({
    status: 200,
    message: `Department display updated to ${displayValue}!`,
    data: reward,
  });
});

// exports.getRewardsByDisplayedDept = asyncHandler(async (req, res) => {
//   const { departmentid } = req.body;

//   if (!departmentid) {
//     return res.status(400).json({
//       status: "fail",
//       message: "departmentid required",
//     });
//   }

//   let rewards = await RewardsModel.find()
//     .populate("departments.department")
//     .populate("categories.category");

//   rewards = rewards.filter((reward) => {

//     // 1- القسم موجود في departments + display = true
//     const hasDisplayedDepartment = reward.departments.some(
//       (d) =>
//         d.display === true &&
//         d.department?._id.toString() === departmentid
//     );

//     // 2- القسم موجود داخل category.departments
//     const departmentInCategory = reward.categories.some((c) =>
//       c.category?.departments?.some(
//         (depId) => depId.toString() === departmentid
//       )
//     );

//     return hasDisplayedDepartment && departmentInCategory;
//   });

//   res.status(200).json({
//     status: "success",
//     results: rewards.length,
//     data: rewards,
//   });
// });



// exports.getRewardsByDisplayedDept = asyncHandler(async (req, res) => {
//   const { departmentid } = req.body;

//   if (!departmentid) {
//     return res.status(400).json({
//       status: "fail",
//       message: "departmentid required",
//     });
//   }

//   if (!mongoose.Types.ObjectId.isValid(departmentid)) {
//     return res.status(400).json({
//       status: "fail",
//       message: "Invalid department id",
//     });
//   }

//   const deptId = new mongoose.Types.ObjectId(departmentid);

//   const rewards = await RewardsModel.aggregate([
//     {
//       $match: {
//         departments: {
//           $elemMatch: {
//             department: deptId,
//             display: true,
//           },
//         },
//       },
//     },
//     {
//       $addFields: {
//         categories: {
//           $filter: {
//             input: "$categories",
//             as: "cat",
//             cond: { $eq: ["$$cat.category", "$$cat.category"] },
//           },
//         },
//       },
//     },
//   ]);

//   res.status(200).json({
//     status: "success",
//     results: rewards.length,
//     data: rewards,
//   });
// });


exports.getRewardsByDisplayedDept = asyncHandler(async (req, res) => {
  const { departmentid } = req.body;

  if (!departmentid) {
    return res.status(400).json({
      status: "fail",
      message: "departmentid required",
    });
  }

  let rewards = await RewardsModel.find()
    .populate("departments.department")
    .populate("categories.category");

  rewards = rewards
    .map((reward) => {
      const hasDisplayedDepartment = reward.departments.some(
        (d) =>
          d.display === true &&
          d.department?._id.toString() === departmentid
      );

      if (!hasDisplayedDepartment) return null;

      const filteredCategories = reward.categories.filter((c) =>
        c.category?.departments?.some(
          (depId) => depId.toString() === departmentid
        )
      );

      if (filteredCategories.length === 0) return null;

      reward.categories = filteredCategories; 
      return reward;
    })
    .filter(Boolean); 

  res.status(200).json({
    status: "success",
    results: rewards.length,
    data: rewards,
  });
});
