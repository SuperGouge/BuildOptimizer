var router = require("express").Router({ mergeParams: true });

var matchlist = require("../../controllers/api/matchlist");

router.get("/:summonerId", matchlist.getMatchList);

module.exports = router;