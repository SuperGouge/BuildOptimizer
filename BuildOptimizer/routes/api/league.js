var router = require("express").Router({ mergeParams: true });

var league = require("../../controllers/api/league");

router.get("/challenger", league.getChallengerLeagueSolo);

router.get("/master", league.getMasterLeagueSolo);

module.exports = router;