var router = require("express").Router();

var league = require("./api/league");
var lolStaticData = require("./api/lolStaticData");
var match = require("./api/match");
var matchlist = require("./api/matchlist");
var pro = require("./api/pro");

router.use("/league/:region", league);

router.use("/lol-static-data/:region", lolStaticData);

router.use("/match/:region", match);

router.use("/matchlist/:region", matchlist);

router.use("/pro", pro);

module.exports = router;