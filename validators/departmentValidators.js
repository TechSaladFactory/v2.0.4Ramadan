const { body, param, validationResult } = require('express-validator');

const addDepartmentsValidators = [
    body("name")
    .trim()
    .notEmpty().withMessage("Department name is required!")
    .isLength({ min: 1 }).withMessage("Department name must be at least 4 characters long"),

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

const getSpecialDepartmentByidValidators = [
    param("id").isMongoId().withMessage("Invalid Department ID!"),
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
const updateDepartmentByIDValidators = [
    body("name")
        .trim()
        .notEmpty().withMessage("Department name is required!"),
    param("id").isMongoId().withMessage("Invalid Department ID!"), body("name")
        .optional()
        .trim()
        .isLength({ min: 1 }).withMessage("Department name must be at least 4 characters long"),
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
const deleteDepartmentByIDValidators = [
    param("id").isMongoId().withMessage("Invalid Department ID!"),
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
    getSpecialDepartmentByidValidators,
    updateDepartmentByIDValidators,
    deleteDepartmentByIDValidators, addDepartmentsValidators
};