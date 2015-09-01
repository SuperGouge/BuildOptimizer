var router = require("express").Router({ mergeParams: true });

var lolStaticData = require("../../controllers/api/lolStaticData");

router.get("/champion", lolStaticData.getChampionList);

router.get("/champion/:championId", lolStaticData.getChampionById);

router.get("/versions", lolStaticData.getVersions);

module.exports = router;