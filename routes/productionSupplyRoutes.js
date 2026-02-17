const express = require("express");
const router = express.Router();


const {
    sendProductionSupplyRequests,
    approveSelectedProductionSupplyRequests,
    getPendingProductionSupplyRequests,
    getApprovedProductionSupplys,
    deletependingrequestByID,
    deleteaccpetedProductionSupplyByID,
    updatePendingRequestQtyByID,
    updateProductionSupplyQty,
    updateHistoryAndSync,
    getAllHistory,
    deleteHistoryAndSync,
    getAllSendHistory,
    deleteSendHistoryById,
    updateSendHistory,exportDetailedExcel
  } = require("../services/productionSupplyServices");

// المستخدم يرسل طلبات
router.route("/request").post( sendProductionSupplyRequests);

// المشرف يعتمد طلب
router.route("/approve").post( approveSelectedProductionSupplyRequests);

// عرض الطلبات المعلقة
router.route("/requests/pending").get(getPendingProductionSupplyRequests);


router.route("/refusePendingRequest/:id").delete(deletependingrequestByID)
router.route("/refuseacceptedRequest/:id").delete(deleteaccpetedProductionSupplyByID)
router.route("/updateQty/:id").put(updatePendingRequestQtyByID)
router.route("/QtyProductionSupply/:id").put(updateProductionSupplyQty)

// عرض المنتجات المعتمدة (اختياري)
router.route("/approved").get(getApprovedProductionSupplys);
//History



// تعديل عملية في History ومزامنتها مع الإنتاج
router.route("/history/:historyId").put(updateHistoryAndSync);

// عرض كل السجلات في History
router.route("/history").get(getAllHistory);
router.route("/deletehistory/:historyId").delete(deleteHistoryAndSync);
router.route("/send/getAllSendHistory").get(getAllSendHistory);
router.route("/downloadHistoryS_Excel").get(exportDetailedExcel)
router.route("/send/deleteHistorysend/:id").delete(deleteSendHistoryById)
router.route("/send/updateHistorysend/:id").put(updateSendHistory)
module.exports = router;
