const { body, param, validationResult } = require("express-validator");
const ApiErrors = require("../utils/apiErrors");

const { UnitModel } = require("../models/unitModel"); // استبدل بالمسار الصحيح
const { SupplierModel } = require("../models/supplierModel");
const mongoose = require("mongoose");

const addproductValidators = [
    body("bracode")
        .trim()
        .notEmpty()
        .withMessage("product bracode is required!"),

    // body("availableQuantity")
    //     .trim()
    //     .notEmpty()
    //     .withMessage("product availableQuantity is required!"),

    // body("unit")
    //     .notEmpty()
    //     .withMessage("product unit is required!")
    //     .custom(async (value) => {
    //         if (!mongoose.Types.ObjectId.isValid(value)) {
    //             throw new Error("Invalid unit ID format");
    //         }
    //         const unit = await UnitModel.findById(value);
    //         if (!unit) {
    //             throw new Error("Unit not found");
    //         }
    //         return true;
    //     }),

    // body("supplierAccepted")
    //     .notEmpty()
    //     .withMessage("product supplierAccepted is required!")
    //     .custom(async (value) => {
    //         if (!mongoose.Types.ObjectId.isValid(value)) {
    //             throw new Error("Invalid supplier ID format");
    //         }
    //         const supplier = await SupplierModel.findById(value);
    //         if (!supplier) {
    //             throw new Error("Supplier not found");
    //         }
    //         return true;
    //     }),

    // body("name")
    //     .trim()
    //     .notEmpty()
    //     .withMessage("product name is required!")
    //     .isLength({ min: 2 })
    //     .withMessage("product name must be at least 4 characters long"),

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

const getSpecialproductByidValidators = [
    param("id").isMongoId().withMessage("Invalid product ID!"),
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

const updateproductByIDValidators = [
    param("id").isMongoId().withMessage("Invalid product ID!"),
    body("bracode")
        .trim()
        .notEmpty()
        .withMessage("product bracode is required!"),

    body("availableQuantity")
        .trim()
        .notEmpty()
        .withMessage("product availableQuantity is required!"),

    body("unit")
        .notEmpty()
        .withMessage("product unit is required!")
        .custom(async (value) => {
            if (!mongoose.Types.ObjectId.isValid(value)) {
                throw new Error("Invalid unit ID format");
            }
            const unit = await UnitModel.findById(value);
            if (!unit) {
                throw new Error("Unit not found");
            }
            return true;
        }),

    body("supplierAccepted")
        .notEmpty()
        .withMessage("product supplierAccepted is required!")
        .custom(async (value) => {
            if (!mongoose.Types.ObjectId.isValid(value)) {
                throw new Error("Invalid supplier ID format");
            }
            const supplier = await SupplierModel.findById(value);
            if (!supplier) {
                throw new Error("Supplier not found");
            }
            return true;
        }),

    body("name")
        .trim()
        .notEmpty()
        .withMessage("product name is required!")
        .isLength({ min: 4 })
        .withMessage("product name must be at least 4 characters long"),

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

const deleteproductByIDValidators = [
    param("id").isMongoId().withMessage("Invalid product ID!"),
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

const UpdateminQtyByIDValidators = [
    // تحقق من أن id هو MongoID صحيح
    param("id").isMongoId().withMessage("Invalid product ID!"),

    // تحقق من وجود minQuantity وأنه عدد صحيح وغير سالب
    body("minQuantity")
        .notEmpty()
        .withMessage("Product minQuantity is required!")
        .custom((value) => {
            if (value < 0) {
                throw new Error("Product minQuantity must be 0 or greater");
            }
            return true;
        }),

    // معالجة الأخطاء إن وجدت
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
    getSpecialproductByidValidators,
    updateproductByIDValidators,
    deleteproductByIDValidators,
    addproductValidators,
    UpdateminQtyByIDValidators,
};
