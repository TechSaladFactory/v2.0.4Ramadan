const { body, param, validationResult } = require("express-validator");
const ApiErrors = require("../utils/apiErrors");
const mongoose = require("mongoose");
const { DepartmentModel } = require("../models/departmentModel"); // عدّل حسب مسار مشروعك

const addnewuserValidators = [

  body("name")
    .notEmpty()
    .withMessage("User name is required!")
    .isLength({ min: 4 })
    .withMessage("User name must be at least 4 characters long"),

  body("department")
    .notEmpty()
    .withMessage("User department is required!")
    .custom((value) => {
      // نتحقق أن department نص أو مصفوفة وليست فارغة
      if (typeof value === "string") {
        if (value.trim() === "")
          throw new Error("Department must not be empty");
      } else if (Array.isArray(value)) {
        if (value.length === 0) throw new Error("Department must not be empty");
      } else {
        throw new Error("Department must be a string or array");
      }
      return true;
    })
    .bail() // لو الخطأ حصل هنا، لا تكمل باقي التحقق
    .custom(async (value) => {
      // تحويل النص إلى مصفوفة لو كان نص مفصول بفواصل
      let departments = value;
      if (typeof value === "string") {
        departments = value.split(",").map((id) => id.trim());
      }

      // تحقق من صحة كل ID
      for (const id of departments) {
        if (!mongoose.Types.ObjectId.isValid(id)) {
          throw new Error(`Invalid department ID format: ${id}`);
        }
      }

      // تحقق من وجود الأقسام في قاعدة البيانات
      const existingDepartments = await DepartmentModel.find({
        _id: { $in: departments },
      }).select("_id");

      if (existingDepartments.length !== departments.length) {
        throw new Error("One or more department IDs do not exist");
      }

      return true;
    }),

  body("phone").optional().isMobilePhone().withMessage("Invalid phone number"),


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

const getSpecialuserByidValidators = [
  param("id").isMongoId().withMessage("Invalid user ID!"),
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

const updateuserByIDValidators = [
  param("id").isMongoId().withMessage("Invalid user ID!"),

  body("role")
    .optional()
    .isIn(["user", "admin"])
    .withMessage("Role must be one of: user, admin"),
  body("name")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("User name is required!")
    .isLength({ min: 4 })
    .withMessage("User name must be at least 4 characters long"),
  body("phone").optional().isMobilePhone().withMessage("Invalid phone number"),
  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 4, max: 4 })
    .withMessage("Password must be at least 4 characters long")
    .isInt()
    .withMessage("Password must be integar"),
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

const deleteuserByIDValidators = [
  param("id").isMongoId().withMessage("Invalid user ID!"),
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

//update users by pass Validator

const updateUserPasswordByIDValidators = [
  param("id").isMongoId().withMessage("Invalid user ID!"),
  // Password validation
  body("currentPassward")
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

const updateUserDepValidators = [
  param("id").isMongoId().withMessage("Invalid user ID!"),

  body("department").notEmpty().withMessage("department is required"),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const formattedErrors = errors.array().map((err) => ({
        message: err.msg,
        status: 400,
      }));
      return res.status(400).json(formattedErrors);
    }
    return next();
  },
];
//permissionusertoaddValidators
const permissionusertoaddValidators = [
  param("id").isMongoId().withMessage("Invalid user ID!"),

  body("canAddProduct").notEmpty().withMessage("canAddProduct is required"),
  body("canAddProduct")
    .isBoolean()
    .withMessage("canAddProduct must be boolean ( true or false )"),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const formattedErrors = errors.array().map((err) => ({
        message: err.msg,
        status: 400,
      }));
      return res.status(400).json(formattedErrors);
    }
    return next();
  },
];

//permissionusertoremoveValidators
const permissionusertoremoveValidators = [
  param("id").isMongoId().withMessage("Invalid user ID!"),

  body("canRemoveProduct")
    .notEmpty()
    .withMessage("canRemoveProduct is required"),
  body("canRemoveProduct")
    .isBoolean()
    .withMessage("canRemoveProduct must be boolean ( true or false )"),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const formattedErrors = errors.array().map((err) => ({
        message: err.msg,
        status: 400,
      }));
      return res.status(400).json(formattedErrors);
    }
    return next();
  },
];

const activeAccountValidators = [
  param("id").isMongoId().withMessage("Invalid user ID!"),

  body("isVerified").notEmpty().withMessage("isVerified is required"),
  body("isVerified")
    .isBoolean()
    .withMessage("isVerified must be boolean ( true or false )"),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const formattedErrors = errors.array().map((err) => ({
        message: err.msg,
        status: 400,
      }));
      return res.status(400).json(formattedErrors);
    }
    return next();
  },
];
const canaddProductValidators = [
  param("id").isMongoId().withMessage("Invalid user ID!"),

  body("canaddProduct").notEmpty().withMessage("canaddProduct is required"),
  body("canaddProduct")
    .isBoolean()
    .withMessage("canaddProduct must be boolean ( true or false )"),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const formattedErrors = errors.array().map((err) => ({
        message: err.msg,
        status: 400,
      }));
      return res.status(400).json(formattedErrors);
    }
    return next();
  },
];

module.exports = {
  permissionusertoaddValidators,
  updateUserDepValidators,
  getSpecialuserByidValidators,
  permissionusertoremoveValidators,
  updateuserByIDValidators,
  deleteuserByIDValidators,
  addnewuserValidators,
  updateUserPasswordByIDValidators,
  activeAccountValidators,
  canaddProductValidators
};
