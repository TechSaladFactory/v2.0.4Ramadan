const asyncHandler = require("express-async-handler");
const slugify = require("slugify");
const { categoryModel } = require("../models/categoryModel");
const ApiErrors = require("../utils/apiErrors");

/* ================= GET ALL ================= */
exports.getcategory = asyncHandler(async (req, res) => {

  const allcategory = await categoryModel
    .find({})
    .populate("departments", "name");

  res.status(200).json({
    data: allcategory,
    itemsnumber: allcategory.length,
    status: 200,
  });
});

/* ================= GET BY ID ================= */
exports.getSpecialcategoryByid = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const categoryByid = await categoryModel
    .findById(id)
    .populate("departments");

  if (!categoryByid) {
    return next(new ApiErrors(`No category found for ID: ${id}`, 404));
  }

  res.status(200).json({ data: categoryByid, status: 200 });
});

/* ================= CREATE ================= */
exports.addcategory = asyncHandler(async (req, res, next) => {
  const { name, departments } = req.body;

  if (!name || name.trim() === "") {
    return next(new ApiErrors("name is required!", 400));
  }

  const existingcategory = await categoryModel.findOne({ name });
  if (existingcategory) {
    return next(new ApiErrors("category already exists!", 400));
  }

  const categoryresponse = await categoryModel.create({
    name,
    slug: slugify(name),
    departments: departments || [],
  });

  res.status(201).json({
    data: categoryresponse,
    message: "category added successfully!",
    status: 201,
  });
});

/* ================= UPDATE ================= */
exports.updatecategoryByID = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { name, departments } = req.body;

  if (!name || name.trim() === "") {
    return next(new ApiErrors("category name required!", 400));
  }

  const categoryAfterUpdated = await categoryModel.findByIdAndUpdate(
    id,
    {
      name,
      slug: slugify(name),
      ...(departments && { departments }),
    },
    { new: true }
  );

  if (!categoryAfterUpdated) {
    return next(new ApiErrors(`No category found for ID: ${id}`, 404));
  }

  res.status(200).json({
    message: "category updated successfully!",
    status: 200,
    data: categoryAfterUpdated,
  });
});

/* ================= DELETE ================= */
exports.deletecategoryByID = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const deletedcategory = await categoryModel.findByIdAndDelete(id);

  if (!deletedcategory) {
    return next(new ApiErrors(`No category found for ID: ${id}`, 404));
  }

  res.status(200).json({
    message: "category deleted successfully!",
    status: 200,
    data: deletedcategory,
  });
});

/* ============ ADD DEPARTMENT TO CATEGORY ============ */
// POST /api/category/:id/add-department
exports.addDepartmentToCategory = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { departmentId } = req.body;

  const category = await categoryModel.findByIdAndUpdate(
    id,
    { $addToSet: { departments: departmentId } }, // no duplicates
    { new: true }
  );

  if (!category) {
    return next(new ApiErrors("Category not found", 404));
  }

  res.status(200).json({ data: category });
});
