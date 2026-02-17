const express = require("express");
const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const {
    addreedem,
    getreedem,
    getAllRewardsByCategoryID,
    getSpecialreedemByid,
    updatereedemByID,
    deletereedemByID,
    getAllRewardsByDepartmentID,
    makeRewardsShow,
    getRewardsByDisplayedDept
} = require("../services/rewardsServices");

const router = express.Router();

router.route("/updateShowR/:id").put(makeRewardsShow);

router.route("/create").post(upload.single("image"), addreedem);

router.route("/getall").get(getreedem);

router.route("/cat/:id").get(getAllRewardsByCategoryID);

router.route("/dep/:id").get(getAllRewardsByDepartmentID);

router.route("/displayedByDepart").post(getRewardsByDisplayedDept);

router.route("/:id")
    .get(getSpecialreedemByid)
    .put(upload.single("image"), updatereedemByID)
    .delete(deletereedemByID);

module.exports = router;
