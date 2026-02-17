const { body, param, validationResult } = require('express-validator');

const addSuppliersValidators = [
    body("name")
    .trim()
    .notEmpty().withMessage("Supplier name is required!")
    .isLength({ min: 4 }).withMessage("Supplier name must be at least 4 characters long"),

    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                message: errors.array(),
                status: 400
            });
        }
        next();
    }
];

const getSpecialSupplierByidValidators = [
    param("id").isMongoId().withMessage("Invalid Supplier ID!"),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                message: errors.array(),
                status: 400
            });
        }
        next();
    }
];
const updateSupplierByIDValidators = [
    body("name")
        .trim()
        .notEmpty().withMessage("Supplier name is required!"),
    param("id").isMongoId().withMessage("Invalid Supplier ID!"), body("name")
        .optional()
        .trim()
        .isLength({ min: 4 }).withMessage("Supplier name must be at least 4 characters long"),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                message: errors.array(),
                status: 400
            });
        }
        next();
    }
];
const deleteSupplierByIDValidators = [
    param("id").isMongoId().withMessage("Invalid Supplier ID!"),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                message: errors.array(),
                status: 400
            });
        }
        next();
    }
];

module.exports = {
    getSpecialSupplierByidValidators,
    updateSupplierByIDValidators,
    deleteSupplierByIDValidators, addSuppliersValidators
};