const express = require("express");
const multer = require("multer");
const {
    addMission,
getAllMissions,
updateMissionById,
deleteMissionById,
getAllMissionByDep
} = require("../services/missionServices");

const router = express.Router();
router.route("/create").post(addMission)
router.route("/getAll").get(getAllMissions);
router.route("/:id").put(updateMissionById).delete(deleteMissionById)
router.route("/department/:id").get(getAllMissionByDep)
module.exports = router;
