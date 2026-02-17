const { body, param, validationResult } = require("express-validator");
const mongoose = require("mongoose");

// 1. Validator لإضافة منتج
const addproductOPValidators = [
  body("name")
    .notEmpty().withMessage("productOP name is required!")
    .isLength({ min: 2, max: 32 }).withMessage("productOP name must be between 2 and 32 characters"),

  body("bracode")
    .notEmpty().withMessage("productOP bracode is required!")
    .isLength({ min: 3 }).withMessage("productOP bracode must be at least 3 characters"),

  body("packSize")
    .optional().isString().withMessage("packSize must be a string"),

  body("mainProductOP")
    .optional()
    .custom((value) => {
      if (value && !mongoose.Types.ObjectId.isValid(value)) {
        throw new Error("Invalid mainProductOP ID format");
      }
      return true;
    }),

  body("isorderProduction")
    .optional()
    .isBoolean().withMessage("isorderProduction must be boolean"),

  // التحقق من الأخطاء
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const formattedErrors = errors.array().map(err => ({
        message: err.msg,
        status: 400,
      }));
      return res.status(400).json(formattedErrors);
    }
    next();
  }
];

// 2. Validator للحصول على منتج بالـ ID
const getSpecialproductOPByidValidators = [
  param("id").isMongoId().withMessage("Invalid productOP ID!"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const formattedErrors = errors.array().map(err => ({
        message: err.msg,
        status: 400,
      }));
      return res.status(400).json(formattedErrors);
    }
    next();
  }
];

// 3. Validator لتحديث منتج
const updateproductOPByIDValidators = [
  param("id").isMongoId().withMessage("Invalid productOP ID!"),

  body("name")
    .optional()
    .isLength({ min: 2, max: 32 }).withMessage("productOP name must be between 2 and 32 characters"),

  body("bracode")
    .optional()
    .isLength({ min: 3 }).withMessage("productOP bracode must be at least 3 characters"),

  body("packSize")
    .optional()
    .isString().withMessage("packSize must be a string"),

  body("mainProductOP")
    .optional()
    .custom((value) => {
      if (value && !mongoose.Types.ObjectId.isValid(value)) {
        throw new Error("Invalid mainProductOP ID format");
      }
      return true;
    }),

  body("isorderProduction")
    .optional()
    .isBoolean().withMessage("isorderProduction must be boolean"),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const formattedErrors = errors.array().map(err => ({
        message: err.msg,
        status: 400,
      }));
      return res.status(400).json(formattedErrors);
    }
    next();
  }
];

// 4. Validator لحذف منتج
const deleteproductOPByIDValidators = [
  param("id").isMongoId().withMessage("Invalid productOP ID!"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const formattedErrors = errors.array().map(err => ({
        message: err.msg,
        status: 400,
      }));
      return res.status(400).json(formattedErrors);
    }
    next();
  }
];

module.exports = {
  addproductOPValidators,
  getSpecialproductOPByidValidators,
  updateproductOPByIDValidators,
  deleteproductOPByIDValidators,
};
