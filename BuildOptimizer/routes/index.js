var router = require("express").Router();

var index = require("../controllers/index");

router.get("/", index.render);

module.exports = router;