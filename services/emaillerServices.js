const { default: slugify } = require("slugify");
const { EmaillerModel } = require("../models/emaillerModel");
const asyncHandler = require("express-async-handler");
const ApiErrors = require("../utils/apiErrors");

// GET all email entries (assumes only one exists)
exports.getEmailler = asyncHandler(async (req, res) => {
  const emailer = await EmaillerModel.find({});

  res.status(200).json({
    data: emailer,
    itemsnumber: emailer.length,
    status: 200,
  });
});

// UPDATE email by ID
exports.updateEmailler = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { email } = req.body;

  if (!email) {
    throw new ApiErrors("Please provide a new email", 400);
  }

  const updatedEmailler = await EmaillerModel.findByIdAndUpdate(
    id,
    { email },
    { new: true }
  );

  if (!updatedEmailler) {
    throw new ApiErrors("Email not found", 404);
  }

  res.status(200).json({
    message: "Email updated successfully",
    data: updatedEmailler,
    status: 200,
  });
});

// CREATE email (only allows one entry)
exports.createEmailler = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    throw new ApiErrors("Please provide an email address", 400);
  }

  const existing = await EmaillerModel.findOne();
  if (existing) {
    throw new ApiErrors("An email already exists. Only one is allowed.", 400);
  }

  const newEmailler = await EmaillerModel.create({ email });

  res.status(201).json({
    message: "Email created successfully",
    data: newEmailler,
    status: 201,
  });
});
