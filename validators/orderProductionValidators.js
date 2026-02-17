const { body, param, validationResult } = require("express-validator");

// ✅ Create OrderProduction
const createOrderProductionValidator = [
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

// ✅ Get OrderProduction by ID
const getOrderProductionByIdValidator = [
  param("id")
    .isMongoId().withMessage("Invalid OrderProduction ID!"),

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

// ✅ Update OrderProduction
const updateOrderProductionValidator = [
  param("id")
    .isMongoId().withMessage("Invalid OrderProduction ID!"),

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

// ✅ Delete OrderProduction
const deleteOrderProductionValidator = [
  param("id")
    .isMongoId().withMessage("Invalid OrderProduction ID!"),

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
  createOrderProductionValidator,
  getOrderProductionByIdValidator,
  updateOrderProductionValidator,
  deleteOrderProductionValidator,
};
