const { body, param, validationResult } = require('express-validator');

const addunitValidators = [
    body("name")
    .trim()
    .notEmpty().withMessage("unit name is required!")
    .isLength({ min: 1 }).withMessage("unit name must be at least 1 characters long"),

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

const getSpecialunitByidValidators = [
    param("id").isMongoId().withMessage("Invalid unit ID!"),
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
const updateunitByIDValidators = [
    body("name")
        .trim()
        .notEmpty().withMessage("unit name is required!"),
    param("id").isMongoId().withMessage("Invalid unit ID!"), body("name")
        .optional()
        .trim()
        .isLength({ min: 1 }).withMessage("unit name must be at least 1 characters long"),
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
const deleteunitByIDValidators = [
    param("id").isMongoId().withMessage("Invalid unit ID!"),
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
    getSpecialunitByidValidators,
    updateunitByIDValidators,
    deleteunitByIDValidators, addunitValidators
};