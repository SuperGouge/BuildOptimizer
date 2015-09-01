var riotApi = require("../../lib/riot-api").init("lol-static-data");

exports.getChampionList = function(req, res, next) {
    riotApi.request("/champion", { region: req.params.region }, function(error, data) {
        res.json(data);
    });
};

exports.getChampionById = function(req, res, next) {
    riotApi.request("/champion/" + req.params.championId, { region: req.params.region }, function(error, data) {
        res.json(data);
    });
};

exports.getVersions = function(req, res, next) {
    riotApi.request("/versions", { region: req.params.region }, function(error, data) {
        res.json(data);
    });
};