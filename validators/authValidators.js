const { body, param, validationResult } = require("express-validator");
//const ApiErrors = require("../utils/apiErrors");

// signUpValidators

const signUpValidators = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("User name is required!")
    .isLength({ min: 4 })
    .withMessage("User name must be at least 4 characters long"),
  body("email").optional().isEmail().withMessage("Invalid email format"),
  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 4 }),
  body("passwordConfirm")
    .notEmpty()
    .withMessage("Password confirmation is required")
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Passwords do not match");
      }
      return true;
    }),
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
// LoginValidators
const LoginValidators = [
  body("password").notEmpty().withMessage("Password is required"),
  body("password").isInt().withMessage("Password must be number is required"),

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
const forgetValidators = [
  body("email").optional().isEmail().withMessage("Invalid email format"),

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

const changepasswordValidators = [
  body("newpassword")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 8, max: 128 })
    .withMessage("Password must be between 8 and 128 characters long")
    .matches(/[a-z]/)
    .withMessage("Password must contain at least one lowercase letter")
    .matches(/[A-Z]/)
    .withMessage("Password must contain at least one uppercase letter")
    .matches(/[0-9]/)
    .withMessage("Password must contain at least one number")
    .matches(/[@$!%*?&]/)
    .withMessage("Password must contain at least one special character"),

  // Password confirmation
  body("passwordConfirm")
    .notEmpty()
    .withMessage("Password confirmation is required")
    .custom((value, { req }) => {
      if (value !== req.body.newpassword) {
        throw new Error("Passwords do not match");
      }
      return true;
    }),

  // Error handler
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

const getverfyemailValidators = [
  body("email").optional().isEmail().withMessage("Invalid email format"),

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
const getuserValidators = [
  body("email").optional().isEmail().withMessage("Invalid email format"),

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

const changepasswordNotsessionedValidators = [
  body("email").optional().isEmail().withMessage("Invalid email format"),
  body("newpassword")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 8, max: 128 })
    .withMessage("Password must be between 8 and 128 characters long")
    .matches(/[a-z]/)
    .withMessage("Password must contain at least one lowercase letter")
    .matches(/[A-Z]/)
    .withMessage("Password must contain at least one uppercase letter")
    .matches(/[0-9]/)
    .withMessage("Password must contain at least one number")
    .matches(/[@$!%*?&]/)
    .withMessage("Password must contain at least one special character"),

  // Password confirmation
  body("passwordConfirm")
    .notEmpty()
    .withMessage("Password confirmation is required")
    .custom((value, { req }) => {
      if (value !== req.body.newpassword) {
        throw new Error("Passwords do not match");
      }
      return true;
    }),

  // Error handler
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

const updateuserdataSessionedValidators = [
  body("name")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("User name is required!")
    .isLength({ min: 4 })
    .withMessage("User name must be at least 4 characters long"),
  body("phone").optional().isMobilePhone().withMessage("Invalid phone number"),

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
  signUpValidators,
  forgetValidators,
  LoginValidators,
  changepasswordValidators,
  getverfyemailValidators,
  getuserValidators,
  changepasswordNotsessionedValidators,
  updateuserdataSessionedValidators,
};
