const asyncHandler = require("express-async-handler");
const ApiErrors = require("../utils/apiErrors");
const MissionModel = require("../models/missionModel"); // عدّل المسار حسب مشروعك
const searchByname = require("../utils/searchBykeyword");
const missionModel = require("../models/missionModel");

/**
 * @desc    Get all mission
 * @route   GET /api/mission
 */
exports.getAllMissions = asyncHandler(async (req, res) => {
  const filter = searchByname(req.query);

  const page = req.query.page ? parseInt(req.query.page) : null;
  const limit = req.query.limit ? parseInt(req.query.limit) : null;

  let query = MissionModel.find(filter).populate("department");

  // تطبيق pagination لو موجود
  if (page && limit) {
    const skip = (page - 1) * limit;
    query = query.skip(skip).limit(limit);
  }

  const missions = await query.lean();

  // عدد العناصر الكلي
  const total = await MissionModel.countDocuments(filter);

  res.status(200).json({
    data: missions,
    currentPage: page || 1,
    totalPages: limit ? Math.ceil(total / limit) : 1,
    totalItems: total,
    itemsPerPage: limit || total,
    status: 200,
  });
});

/**
 * @desc    Get mission by ID
 * @route   GET /api/mission/:id
 */
exports.getMissionById = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const mission = await MissionModel.findById(id).populate("department");

  if (!mission) {
    return next(new ApiErrors(`No mission found for ID: ${id}`, 404));
  }

  res.status(200).json({ data: mission });
});

/**
 * @desc    Create new mission
 * @route   POST /api/create
 */
exports.addMission = asyncHandler(async (req, res, next) => {
  const { info, department } = req.body;

  if (!info || info.trim() === "") {
    return next(new ApiErrors("Mission info is required", 400));
  }

  const mission = await MissionModel.create({
    info,
    department,
  });

  res.status(201).json({
    message: "Mission created successfully",
    data: mission,
  });
});

/**
 * @desc    Update mission
 * @route   PUT /api/mission/:id
 */
exports.updateMissionById = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { info, department } = req.body;

  if (!info || info.trim() === "") {
    return next(new ApiErrors("Mission info is required", 400));
  }

  const updatedMission = await MissionModel.findByIdAndUpdate(
    id,
    { info, department },
    { new: true }
  );

  if (!updatedMission) {
    return next(new ApiErrors(`No mission found for ID: ${id}`, 404));
  }

  res.status(200).json({
    message: "Mission updated successfully",
    data: updatedMission,
  });
});

/**
 * @desc    get mission by Dep
 * @route   DELETE /api/mission/:Depid
 */

exports.getAllMissionByDep=asyncHandler(async(req,res,next)=>{

const {id} =req.params
 const missionDataWithDep = await missionModel.find({
        department:id
    }).populate("department","name")

res.status(200).json({
    status:200,
    data:missionDataWithDep
})
})

/**
 * @desc    Delete mission
 * @route   DELETE /api/mission/:id
 */
exports.deleteMissionById = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const deletedMission = await MissionModel.findByIdAndDelete(id);

  if (!deletedMission) {
    return next(new ApiErrors(`No mission found for ID: ${id}`, 404));
  }

  res.status(200).json({
    message: "Mission deleted successfully",
    data: deletedMission,
  });
});
