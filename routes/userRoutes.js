const express = require("express");
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage });
const { protect, allwoedTo } = require("../services/authServices");

const {
  deleteUserByID,
  updateUserByID,
  getSpecialallUserByid,
  addnewUser,
  getUser,
  updateUserPasswordByid,
  updateUserdeparetmentByID,
  permissionusertoadd,
  permissionusertoremove,
  activeAccount,
  canAddProductIN,
  canProduction,
  canOrderProduction,
  canReceiveProduct,
  canSendProduct,
  canSupplyProduct,
  canDamagedProduct,
  addBranchToUserOP, removeBranchFromUserOP ,
  addBranchToUserOS, removeBranchFromUserOS ,
  canEditLastSupplyProduct,
  canEditLastOrderProductionProduct,
  removeBranchFromUserTawalf,
  addBranchToUserTawalf,
 showaddRZOCasher,
  ShowTawalf,
  showRZOCasher,
  addBranchToUserRezoCasher,
  removeBranchFromUserRezoCasher,
showManageWalaa,
showRZOPhotoCasher  ,
showWalaa
  
} = require("../services/userServices");
//validator imports
const {
  addnewuserValidators,
  getSpecialuserByidValidators,
  updateuserByIDValidators,
  deleteuserByIDValidators,
  updateUserPasswordByIDValidators
  ,updateUserDepValidators,
  permissionusertoaddValidators,
  permissionusertoremoveValidators,
  activeAccountValidators,
  canaddProductValidators
} = require("../validators/userValidators");
const router = express.Router();

router.route("/create").post(
  upload.single('profileImg'),addnewuserValidators, addnewUser);
  router.route("/perToadd/:id").put(permissionusertoaddValidators,permissionusertoadd)
router.route("/updateUserdep/:id").put(updateUserDepValidators,updateUserdeparetmentByID)
  router.route("/perToremove/:id").put(permissionusertoremoveValidators,permissionusertoremove)
router.route("/canAddProductIN/:id").put(canAddProductIN);
router.route("/getAll").get(getUser);
router.route("/resetpassorwd/:id").put(updateUserPasswordByIDValidators,updateUserPasswordByid)
router
  .route("/:id")
  .get( getSpecialuserByidValidators,getSpecialallUserByid)
  .put(upload.single('profileImg'),updateuserByIDValidators, updateUserByID)
  .delete(
    deleteuserByIDValidators,deleteUserByID);
    router.route("/activeAcouunt/:id").put(activeAccountValidators,activeAccount)


    router.put("/canProduction/:id", canProduction);

    // ✅ السماح أو منع المستخدم من "طلب إنتاج"
    router.put("/canOrderProduction/:id/", canOrderProduction);
    
    // ✅ السماح أو منع المستخدم من "الاستلام"
    router.put("/canReceiveProduct/:id", canReceiveProduct);
    router.put("/canSendProduct/:id", canSendProduct);
    router.put("/canSupplyProduct/:id", canSupplyProduct);
    router.put("/canDamagedProduct/:id", canDamagedProduct);

    router.put("/canEditLastSupplyProduct/:id", canEditLastSupplyProduct);
    router.put("/canEditLastOrderProductionProduct/:id", canEditLastOrderProductionProduct);
    router.put("/showTawalf/:id",ShowTawalf)

router.route("/showWalaa/:id").put(showWalaa)


    router.route("/add-branchOP").patch( addBranchToUserOP);
router.route("/remove-branchOP").patch( removeBranchFromUserOP);
router.route("/add-branchOS").patch( addBranchToUserOS);
router.route("/remove-branchOS").patch( removeBranchFromUserOS);

router.route("/add-branchTawalf").patch( addBranchToUserTawalf);
router.route("/remove-branchTawalf").patch( removeBranchFromUserTawalf);

router.route("/showManageWalaa/:id/").put(showManageWalaa);

//cahser
 router.route("/showRZOCasher/:id").put( showRZOCasher);
 router.route("/showaddRZOCasher/:id").put( showaddRZOCasher);
router.route("/add-branchRezoCasher").patch(addBranchToUserRezoCasher)
router.route("/remove-branchRezoCasher").patch(removeBranchFromUserRezoCasher),
   router.route("/showRZOPhotoCasher/:id").put( showRZOPhotoCasher);
module.exports = router;

//
