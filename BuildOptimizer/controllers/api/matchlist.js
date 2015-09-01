var riotApi = require("../../lib/riot-api").init("matchlist");

exports.getMatchList = function(req, res, next) {
    var params = req.query;
    params.region = req.params.region;
    riotApi.request("/by-summoner/" + req.params.summonerId, params, function(error, data) {
        res.json(data);
    });
};
