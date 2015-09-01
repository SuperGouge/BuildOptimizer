var router = require("express").Router({ mergeParams: true });

var match = require("../../controllers/api/match");

router.get("/:matchId", match.getMatch);

module.exports = router;