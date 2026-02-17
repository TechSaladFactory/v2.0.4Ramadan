const express = require("express");

const {
  getAllTransactions,
  getTransactionByID,
  addTransaction,
  updateTransaction,
  deleteTransaction,
  exportTransactionToExcel,
  exportAllTransactionsToExcel,
  addTransactionwhenaddNewProduct
} = require("../services/transactionServices");

const {
  idValidator,
  addTransactionValidator,
  updateTransactionValidator,
} = require("../validators/transactionValidators");

const router = express.Router();

router.get("/getAll", getAllTransactions);
router.post("/addwhenaddNewProduct",addTransactionwhenaddNewProduct)
router.get("/:id", idValidator, getTransactionByID);
router.post("/add", addTransaction);
router.put("/:id", updateTransactionValidator, updateTransaction);
router.delete("/:id", idValidator, deleteTransaction);
router.route('/export/:id').get(exportTransactionToExcel);
router.route("/exports/all").get(exportAllTransactionsToExcel)

module.exports = router;
