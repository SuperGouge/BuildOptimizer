var router = require("express").Router({ mergeParams: true });

var pro = require("../../controllers/api/pro");

router.get("/", pro.getMatchLists);

router.get("/:championId", pro.getMatchListsByChampion);

module.exports = router;