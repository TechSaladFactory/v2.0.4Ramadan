const asyncHandler = require("express-async-handler");
const levelModel=require("../models/levelModel")
exports.getAllLevel = asyncHandler(async (req, res) => {

  const page = parseInt(req.query.page);
  const limit = parseInt(req.query.limit);

  const filter = {};

  const sort = { _id: -1 };

  let data;

  if (!isNaN(page) && !isNaN(limit) && page > 0 && limit > 0) {

    const skip = (page - 1) * limit;

    data = await levelModel
      .find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean();

  } else {

    data = await levelModel
      .find(filter)
      .sort(sort)
      .lean();
  }

  res.status(200).json({
    status: 200,
    count: data.length,
    data
  });

});

exports.createLevel=asyncHandler(async(req,res,next)=>{
const {levelName,levelPoint} =req.body

if (levelName === undefined) {
    return next(new ApiErrors(`levelName are required!`, 404));
  } else if (levelName === "") {
    return next(new ApiErrors(`levelName  must not be empty!`, 404));
  }

const levelData= await levelModel.create({
    levelName,
    levelPoint
})

res.status(200).json({
    status:200,
    massage:"Level Created !"
})
})

exports.updateLevel=asyncHandler(async(req,res,next)=>{
    const {id} =req.params
    const {levelName,levelPoint} =req.body

if (levelName === undefined) {
    return next(new ApiErrors(`levelName are required!`, 404));
  } else if (levelName === "") {
    return next(new ApiErrors(`levelName  must not be empty!`, 404));
  }
  const dataUpdate =await levelModel.findByIdAndUpdate({
    _id:id

  },{
     levelName,
    levelPoint

  },{new:true})
if (!dataUpdate) {
    return next(new ApiErrors(`No level found for ID: ${id}`, 404));
  }
res.status(200).json({
    status:200,
    massage:"Level Upadted !"
})
})

exports.deleteLevel=asyncHandler(async(req,res,next)=>{
const {id} =req.params

const deleteData= await levelModel.findByIdAndDelete({_id:id})

if (!deleteData) {
    return next(new ApiErrors(`No level found for ID: ${id}`, 404));
  }
  res.status(200).json({
    status:200,
    massage:"Level Deleted !"
  })
})
