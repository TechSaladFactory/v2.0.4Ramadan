const { body, param, validationResult } = require("express-validator");

// ✅ Create orderSupplyModel
const createorderSupplyModelValidator = [
  body("branch")
    .notEmpty().withMessage("Branch ID is required!")
    .isMongoId().withMessage("Invalid Branch ID!"),

  body("product")
    .notEmpty().withMessage("Product ID is required!")
    .isMongoId().withMessage("Invalid Product ID!"),

  body("package")
    .notEmpty().withMessage("Package is required!")
    .isString().withMessage("Package must be a string!"),

  body("qty")
    .notEmpty().withMessage("Quantity is required!")
    .isNumeric().withMessage("Qty must be a number!"),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const formattedErrors = errors.array().map((err) => ({
        message: err.msg,
        status: 400,
      }));
      return res.status(400).json(formattedErrors);
    }
    next();
  },
];

// ✅ Get orderSupplyModel by ID
const getorderSupplyModelByIdValidator = [
  param("id")
    .isMongoId().withMessage("Invalid orderSupplyModel ID!"),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const formattedErrors = errors.array().map((err) => ({
        message: err.msg,
        status: 400,
      }));
      return res.status(400).json(formattedErrors);
    }
    next();
  },
];

// ✅ Update orderSupplyModel
const updateorderSupplyModelValidator = [
  param("id")
    .isMongoId().withMessage("Invalid orderSupplyModel ID!"),

  body("branch")
    .optional()
    .isMongoId().withMessage("Invalid Branch ID!"),

  body("product")
    .optional()
    .isMongoId().withMessage("Invalid Product ID!"),

  body("package")
    .optional()
    .isString().withMessage("Package must be a string!"),

  body("qty")
    .optional()
    .isNumeric().withMessage("Qty must be a number!"),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const formattedErrors = errors.array().map((err) => ({
        message: err.msg,
        status: 400,
      }));
      return res.status(400).json(formattedErrors);
    }
    next();
  },
];

// ✅ Delete orderSupplyModel
const deleteorderSupplyModelValidator = [
  param("id")
    .isMongoId().withMessage("Invalid orderSupplyModel ID!"),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const formattedErrors = errors.array().map((err) => ({
        message: err.msg,
        status: 400,
      }));
      return res.status(400).json(formattedErrors);
    }
    next();
  },
];

module.exports = {
  createorderSupplyModelValidator,
  getorderSupplyModelByIdValidator,
  updateorderSupplyModelValidator,
  deleteorderSupplyModelValidator,
};
