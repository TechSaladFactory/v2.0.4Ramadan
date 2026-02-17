const { body, param, validationResult } = require('express-validator');

// Middleware to handle validation result
const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: errors.array(),
      status: 400,
    });
  }
  next();
};

// Validator: Add mainProductOP
const addmainProductOPValidators = [
  body("name")
    .trim()
    .notEmpty().withMessage("mainProductOP name is required!")
    .isLength({ min: 1 }).withMessage("mainProductOP name must be at least 1 character long"),
  handleValidation,
];

// Validator: Get mainProductOP by ID
const getSpecialmainProductOPByidValidators = [
  param("id").isMongoId().withMessage("Invalid mainProductOP ID!"),
  handleValidation,
];

// Validator: Update mainProductOP by ID
const updatemainProductOPByIDValidators = [
  param("id").isMongoId().withMessage("Invalid mainProductOP ID!"),
  body("name")
    .optional()
    .trim()
    .notEmpty().withMessage("mainProductOP name must not be empty")
    .isLength({ min: 1 }).withMessage("mainProductOP name must be at least 1 character long"),
  handleValidation,
];

// Validator: Delete mainProductOP by ID
const deletemainProductOPByIDValidators = [
  param("id").isMongoId().withMessage("Invalid mainProductOP ID!"),
  handleValidation,
];

module.exports = {
  addmainProductOPValidators,
  getSpecialmainProductOPByidValidators,
  updatemainProductOPByIDValidators,
  deletemainProductOPByIDValidators,
};
