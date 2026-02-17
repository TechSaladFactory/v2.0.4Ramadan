const { body, param, validationResult } = require('express-validator');

const addbranchValidators = [
    body("name")
    .trim()
    .notEmpty().withMessage("branch name is required!")
    .isLength({ min: 1 }).withMessage("branch name must be at least 4 characters long"),

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
    }
];

const getSpecialbranchByidValidators = [
    param("id").isMongoId().withMessage("Invalid branch ID!"),
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
    }
];
const updatebranchByIDValidators = [
    body("name")
        .trim()
        .notEmpty().withMessage("branch name is required!"),
    param("id").isMongoId().withMessage("Invalid branch ID!"), body("name")
        .optional()
        .trim()
        .isLength({ min: 1 }).withMessage("branch name must be at least 4 characters long"),
        body("product")
        .optional()
        .isMongoId()
        .withMessage("Invalid product ID!"),
    
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
    }
];
const deletebranchByIDValidators = [
    param("id").isMongoId().withMessage("Invalid branch ID!"),
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
    }
];

module.exports = {
    getSpecialbranchByidValidators,
    updatebranchByIDValidators,
    deletebranchByIDValidators, addbranchValidators
};