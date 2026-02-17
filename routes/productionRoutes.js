const express = require("express");
const router = express.Router();


const {
    sendProductionRequests,
    approveSelectedProductionRequests,
    getPendingProductionRequests,
    getApprovedProductions,
    deletependingrequestByID,
    deleteaccpetedProductionByID,
    updatePendingRequestQtyByID,
    updateProductionQty,
    updateHistoryAndSync,
    getAllHistory,
    deleteHistoryAndSync,
    getAllSendHistory,
    deleteSendHistoryById,
    updateSendHistory,
    exportDetailedExcel,
    exportTotalQtyToExcel
  } = require("../services/productionServices");

// المستخدم يرسل طلبات
router.route("/request").post( sendProductionRequests);

// المشرف يعتمد طلب
router.route("/approve").post( approveSelectedProductionRequests);

// عرض الطلبات المعلقة
router.route("/requests/pending").get(getPendingProductionRequests);


router.route("/refusePendingRequest/:id").delete(deletependingrequestByID)
router.route("/refuseacceptedRequest/:id").delete(deleteaccpetedProductionByID)
router.route("/updateQty/:id").put(updatePendingRequestQtyByID)
router.route("/Qtyproduction/:id").put(updateProductionQty)

// عرض المنتجات المعتمدة (اختياري)
router.route("/approved").get(getApprovedProductions);
//History



// تعديل عملية في History ومزامنتها مع الإنتاج
router.route("/history/:historyId").put(updateHistoryAndSync);

// عرض كل السجلات في History
router.route("/history").get(getAllHistory);
router.route("/deletehistory/:historyId").delete(deleteHistoryAndSync);
router.route("/send/getAllSendHistory").get(getAllSendHistory);
router.route("/downloadHistoryS_Excel").get(exportDetailedExcel)
router.route("/exportTotalQtyToExcel").get(exportTotalQtyToExcel)

router.route("/send/deleteHistorysend/:id").delete(deleteSendHistoryById)
router.route("/send/updateHistorysend/:id").put(updateSendHistory)
module.exports = router;
