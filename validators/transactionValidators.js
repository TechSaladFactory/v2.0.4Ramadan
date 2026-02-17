const mongoose = require("mongoose");
const { body,param, validationResult } = require("express-validator");

// فالييديتور للتحقق من ID في بارامز
const idValidator = [
  param("id")
    .notEmpty()
    .withMessage("ID is required")
    .bail()
    .custom((value) => mongoose.Types.ObjectId.isValid(value))
    .withMessage("Invalid ID format"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json(errors.array());
    }
    next();
  },
];


const addTransactionValidator = [
  body("type")
    .notEmpty()
    .withMessage("type is required")
    .isIn(["IN", "OUT", "INEXIST"])
    .withMessage("type must be either 'IN', 'OUT' or 'INEXIST'"),

  body("userID")
    .notEmpty()
    .withMessage("userID is required")
    .bail()
    .custom((value) => mongoose.Types.ObjectId.isValid(value))
    .withMessage("Invalid userID format"),

  // productID مطلوب فقط لو IN أو OUT
  body("productID").if(body("type").isIn(["IN", "OUT"]))
    .notEmpty()
    .withMessage("productID is required for IN/OUT")
    .bail()
    .custom((value) => mongoose.Types.ObjectId.isValid(value))
    .withMessage("Invalid productID format"),

  // quantity مطلوب في IN / OUT / INEXIST
  body("quantity").if(body("type").isIn([ "OUT", "INEXIST"]))
    .notEmpty()
    .withMessage("quantity is required")
    .bail()
    .isFloat({ min: 0.1 })
    .withMessage("quantity must be a positive number"),

  // unit, department, supplier مطلوبين فقط في OUT
  body("unit").if(body("type").equals("OUT"))
    .notEmpty()
    .withMessage("unit is required for OUT")
    .bail()
    .custom((value) => mongoose.Types.ObjectId.isValid(value))
    .withMessage("Invalid unit format"),

  body("department").if(body("type").equals("OUT"))
    .notEmpty()
    .withMessage("department is required for OUT")
    .bail()
    .custom((value) => mongoose.Types.ObjectId.isValid(value))
    .withMessage("Invalid department format"),

  body("supplier").if(body("type").equals("OUT"))
    .notEmpty()
    .withMessage("supplier is required for OUT")
    .bail()
    .custom((value) => mongoose.Types.ObjectId.isValid(value))
    .withMessage("Invalid supplier format"),

  // supplier و price مطلوبين في INEXIST
  body("supplier").if(body("type").equals("INEXIST"))
    .notEmpty()
    .withMessage("supplier is required for INEXIST")
    .bail()
    .custom((value) => mongoose.Types.ObjectId.isValid(value))
    .withMessage("Invalid supplier format"),

  body("price").if(body("type").equals("INEXIST"))
    .notEmpty()
    .withMessage("price is required for INEXIST")
    .bail()
    .isFloat({ min: 0.01 })
    .withMessage("price must be a positive number"),

  // معالجة الأخطاء
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

module.exports = { addTransactionValidator };

const updateTransactionValidator = [
  idValidator[0], // نفس فالييديتور الـ id
  body("productID")
    .optional()
    .custom((value) => mongoose.Types.ObjectId.isValid(value))
    .withMessage("Invalid productID format"),
  body("type")
    .optional()
    .isIn(["IN", "OUT"])
    .withMessage("type must be either 'IN' or 'OUT'"),
  body("quantity")
    .optional()
    .isFloat({ min: 0.1 })
    .withMessage("quantity must be a positive integer"),
  body("userID")
    .optional()
    .custom((value) => mongoose.Types.ObjectId.isValid(value))
    .withMessage("Invalid userID format"),
  body("unit")
    .optional()
    .custom((value) => mongoose.Types.ObjectId.isValid(value))
    .withMessage("Invalid unit format"),
  body("department")
    .optional()
    .custom((value) => mongoose.Types.ObjectId.isValid(value))
    .withMessage("Invalid department format"),
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
  idValidator,
  addTransactionValidator,
  updateTransactionValidator,
};
