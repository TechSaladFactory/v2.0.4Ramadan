const express = require("express");
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage });

const {
getAllWalaaHistory,
createWalaaHistory,
updateWalaaHistory,
deleteWalaaHistory,
userWalaaHistory,
cancelRedeem,
makeRedeem,
getAllWalaaHistoryPending,
setPointsWalaaHistory,
getAllWalaaGivenPoint,
acceptRedeem,
approveWalaaHistory,
getUserHistory  ,
getUserHistoryucollected,
getWalaaPointsSummary,
  getAllWalaaPendingGivenPoint,
deleteWalaaHistoryPoints
  
} = require("../services/walaaHistoryServices");
;
const router = express.Router();

router.route("/getAll").get(getAllWalaaHistory)
router.route("/getGivenPoint").get(getAllWalaaGivenPoint) 

router.route("/getWalaaPointsSummary").get(getWalaaPointsSummary)


router.route("/getWalaaHistoryPending").get(getAllWalaaHistoryPending)
router.route("/create").post(createWalaaHistory)
router.route("/setPoints").post(setPointsWalaaHistory)
router.route("/makeRedeem").post(makeRedeem)
router.route("/userWHistory").get(userWalaaHistory)
router.route("/redeem/cancelRedeem/:id").put(cancelRedeem)
router.route("/accpetRedeem/:id").put(acceptRedeem)

router.route("/userWHistoryById/:id").get(getUserHistory)

router.route("/deleteWalaaHistoryPoints/:id").delete(deleteWalaaHistoryPoints)

router.route("/:id").put(updateWalaaHistory).delete(deleteWalaaHistory)
router.get("/pointspending", getAllWalaaPendingGivenPoint);
router.route("/getUserHistoryucollected").get(getUserHistoryucollected)
router.patch("/approve-walaa/:id", approveWalaaHistory);

module.exports = router;
