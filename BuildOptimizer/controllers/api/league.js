var riotApi = require("../../lib/riot-api").init("league");

exports.getChallengerLeagueSolo = function(req, res, next) {
    var params = req.query;
    params.region = req.params.region;
    riotApi.request("/challenger", params, function(error, data) {
        res.json(data);
    });
};

exports.getMasterLeagueSolo = function(req, res, next) {
    var params = req.query;
    params.region = req.params.region;
    riotApi.request("/master", params, function(error, data) {
        res.json(data);
    });
};