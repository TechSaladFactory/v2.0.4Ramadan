const { body, param, validationResult } = require('express-validator');

const addfatwraValidators = [
    body("name")
    .trim()
    .notEmpty().withMessage("fatwra name is required!")
    .isLength({ min: 1 }).withMessage("fatwra name must be at least 1 characters long"),

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

const getSpecialfatwraByidValidators = [
    param("id").isMongoId().withMessage("Invalid fatwra ID!"),
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
const updatefatwraByIDValidators = [
    body("name")
        .trim()
        .notEmpty().withMessage("fatwra name is required!"),
    param("id").isMongoId().withMessage("Invalid fatwra ID!"), body("name")
        .optional()
        .trim()
        .isLength({ min: 1 }).withMessage("fatwra name must be at least 1 characters long"),
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
const deletefatwraByIDValidators = [
    param("id").isMongoId().withMessage("Invalid fatwra ID!"),
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
    getSpecialfatwraByidValidators,
    updatefatwraByIDValidators,
    deletefatwraByIDValidators, addfatwraValidators
};