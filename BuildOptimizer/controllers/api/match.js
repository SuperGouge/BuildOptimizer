var riotApi = require("../../lib/riot-api").init("match");

exports.getMatch = function(req, res, next) {
    var params = req.query;
    params.region = req.params.region;
    riotApi.request(req.params.matchId, params, function(error, data) {
        res.json(data);
    });
};
