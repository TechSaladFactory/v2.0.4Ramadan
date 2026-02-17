const { body, param, validationResult } = require('express-validator');

const addmainProductValidators = [
    body("name")
        .trim()
        .notEmpty().withMessage("mainProduct name is required!")
        .isLength({ min: 1 }).withMessage("mainProduct name must be at least 1 characters long"),

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

const getSpecialmainProductByidValidators = [
    param("id").isMongoId().withMessage("Invalid mainProduct ID!"),
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
const updatemainProductByIDValidators = [
    body("name")
        .trim()
        .notEmpty().withMessage("mainProduct name is required!"),
    param("id").isMongoId().withMessage("Invalid mainProduct ID!"), body("name")
        .optional()
        .trim()
        .isLength({ min: 1 }).withMessage("mainProduct name must be at least 1 characters long"),
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
const deletemainProductByIDValidators = [
    param("id").isMongoId().withMessage("Invalid mainProduct ID!"),
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
    getSpecialmainProductByidValidators,
    updatemainProductByIDValidators,
    deletemainProductByIDValidators, addmainProductValidators
};