var async = require("async");
var debug = require("debug")("BuildOptimizer:API-Pro");

var redis = require("../../config/redis");
var league = require("../../lib/riot-api").init("league");
var matchlist = require("../../lib/riot-api").init("matchlist");

var defaultRegions = { br: 5, eune: 50, euw: 100, kr: 100, lan: 5, las: 5, na: 100, oce: 5, ru: 5, tr: 5};

function getPros(callback, regions) {
    regions = (regions && [].concat(regions).reduce(function(obj, region) { obj[region] = defaultRegions[region]; return obj; }, {})) || defaultRegions;
    var cacheKey = "BuildOptimizer-pro-summoner";
    redis.get(cacheKey, function(err, reply) {
        if (reply) {
            callback(null, JSON.parse(reply));
        } else {
            async.parallel(Object.keys(regions).reduce(function(obj, region) {
                obj[region] = function(callback) {
                    league.request("/challenger", { region: region, type: "RANKED_SOLO_5x5" }, function(error, data) {
                        callback(error, data && data.entries && data.entries.sort(function(a, b) {
                            return a.leaguePoints > b.leaguePoints;
                        }).filter(function(entry, index) {
                            return index < regions[region];
                        }).map(function(entry) {
                            return entry.playerOrTeamId;
                        }));
                    });
                };
                return obj;
            }, {}), function(error, pros) {
                if (!error) {
                    redis.set(cacheKey, JSON.stringify(pros));
                    redis.expire(cacheKey, 24 * 60 * 60);
                }
                callback(error, pros);
            });
        }
    });
}

function fetchMatchLists(pros, callback) {
    var cacheKey = "BuildOptimizer-pro-matchlist";
    async.parallel(Object.keys(pros).reduce(function(obj, region) {
        obj[region] = function(callback) {
            async.parallel(pros[region].reduce(function(obj, summonerId) {
                obj[summonerId] = function(callback) {
                    matchlist.request("/by-summoner/" + summonerId, { region: region, beginIndex: 0, endIndex: 10 }, function(error, data) {
                        callback(error, data && data.matches);
                    }, 60 * 60);
                };
                return obj;
            }, {}), callback);
        };
        return obj;
    }, {}), function(error, matchLists) {
        if (!error) {
            redis.set(cacheKey, JSON.stringify(matchLists));
        }
        callback(error, matchLists);
    });
}

function filterMatchListByChampionIds(matchlist, championIds) {
    for (var region in matchlist) {
        if (matchlist.hasOwnProperty(region)) {
            var regionMatchList = matchlist[region];
            for (var summonerId in regionMatchList) {
                if (regionMatchList.hasOwnProperty(summonerId)) {
                    regionMatchList[summonerId] = regionMatchList[summonerId].filter(function(match) {
                        return championIds.indexOf(match.champion) !== -1;
                    });
                    if (!regionMatchList[summonerId].length) {
                        delete regionMatchList[summonerId];
                    }
                }
            }
            if (!Object.keys(regionMatchList).length) {
                delete matchlist[region];
            }
        }
    }
    return matchlist;
}

function getMatchLists(pros, callback, championIds) {
    var cacheKey = "BuildOptimizer-pro-matchlist";
    if (championIds) {
        championIds = [].concat(championIds).map(function(championId) { return parseInt(championId, 10); }).sort();
        cacheKey += "-" + championIds.join(",");
    }
    redis.get(cacheKey, function(err, reply) {
        if (reply) {
            callback(null, JSON.parse(reply));
        } else {
            if (championIds) {
                getMatchLists(pros, function(error, matchlist) {
                    if (!error) {
                        matchlist = filterMatchListByChampionIds(matchlist, championIds);
                        redis.set(cacheKey, JSON.stringify(matchlist));
                        redis.expire(cacheKey, (championIds.length < 2 ? 60 : 30) * 60);
                    }
                    callback(error, matchlist);
                });
            } else {
                fetchMatchLists(pros, callback);
            }
        }
    });
}

function updateMatchLists() {
    debug("Updating pros match lists.");
    getPros(function(error, pros) {
        fetchMatchLists(pros, function(error, matchLists) {
            debug("Updated pros match lists.");
        });
    });
}

updateMatchLists();
setInterval(updateMatchLists, 60 * 60 * 1000);

function asArray(matchlist) {
    return Object.keys(matchlist).reduce(function(array, region) {
        var summoners = matchlist[region];
        for (var summonerId in summoners) {
            if (summoners.hasOwnProperty(summonerId)) {
                array = (function(array, summonerId) {
                    return array.concat(summoners[summonerId].map(function(match) {
                        match.region = region;
                        match.summonerId = parseInt(summonerId, 10);
                        return match;
                    }));
                })(array, summonerId);
            }
        }
        return array;
    }, []);
}

exports.getMatchLists = function(req, res, next) {
    getPros(function(error, pros) {
        getMatchLists(pros, function(error, matchlist) {
            res.json(asArray(matchlist));
        });
    }, req.query.regions);
};

exports.getMatchListsByChampion = function(req, res, next) {
    getPros(function(error, pros) {
        getMatchLists(pros, function(error, matchlist) {
            res.json(asArray(matchlist));
        }, req.params.championId);
    }, req.query.regions);
};
