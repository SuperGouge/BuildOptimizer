var async = require("async");
var queryString = require("query-string");
var request = require("request");
var debug = require("debug")("BuildOptimizer:RiotApi");
var RateLimiter = require("limiter").RateLimiter;

var config = require("../../config/config");
var redis = require("../../config/redis");

var regions = ["br", "eune", "euw", "kr", "lan", "las", "na", "oce", "ru", "tr"];
var regionsPbe = regions.concat("pbe");

var limiters = [new RateLimiter(10, 10 * 1000), new RateLimiter(500, 10 * 60 * 1000)];

var endpoints = {
    champion: { name: "champion", version: "v1.2", regions: regions },
    "current-game": { name: "current-game", version: "v1.0", regions: regionsPbe },
    "featured-games": { name: "featured-games", version: "v1.0", regions: regionsPbe },
    game: { name: "game", version: "v1.3", regions: regions },
    league: { name: "league", version: "v2.5", regions: regions },
    "lol-static-data": { name: "lol-static-data", version: "v1.2", regions: regionsPbe, baseUrl: "https://global.api.pvp.net" },
    "lol-status": { name: "lol-status", version: "v1.0", regions: regionsPbe, baseUrl: "http://status.leagueoflegends.com", requiresApiKey: false },
    match: { name: "match", version: "v2.2", regions: regions },
    matchhistory: { name: "matchhistory", version: "v2.2", regions: regions },
    matchlist: { name: "matchlist", version: "v2.2", regions: regions },
    stats: { name: "stats", version: "v1.3", regions: regions },
    summoner: { name: "summoner", version: "v1.4", regions: regions },
    team: { name: "team", version: "v2.4", regions: regions }
};

function RiotApi(endpointName, apiKey, overrideEndpointVersion) {
    this.endpoint = endpoints[endpointName];
    if (!this.endpoint) {
        throw new Error("Endpoint " + endpointName + " is not a valid endpoint.");
    }
    
    this.apiKey = apiKey || (config && config.riotApiKey);
    if (this.endpoint.requiresApiKey !== false && !this.apiKey) {
        throw new Error("An API key is required to use the " + this.endpoint.name + " endpoint.");
    }
    this.overrideEndpointVersion = overrideEndpointVersion;

    if (this.endpoint.deprecated) {
        debug("Endpoint " + this.endpoint.name + " is deprecated. Support for this endpoint may be dropped in the future.");
    }
}

RiotApi.prototype.getCanonicalPathAndQuery = function(path, params, excludedParams) {
    excludedParams = [].concat(excludedParams);
    var query = queryString.parse(queryString.extract(path));
    for (var key in params) {
        if (params.hasOwnProperty(key) && excludedParams.indexOf(key) === -1) {
            query[key] = params[key];
        }
    }
    query = Object.keys(query).map(function(key) {
        return { name: key, value: query[key] };
    }).sort(function(a, b) {
        return a.name > b.name;
    });
    var queryStringStartIndex = path.indexOf("?");
    if (queryStringStartIndex > -1) {
        path = path.slice(queryStringStartIndex);
    }
    for (var i = 0; i < query.length; i++) {
        path += (i === 0 ? "?" : "&") + query[i].name + "=" + query[i].value;
    }
    return path;
};

RiotApi.prototype.getUrl = function(path, params) {
    if (params.region) {
        params.region = params.region.toLowerCase();
        if (this.endpoint.regions.indexOf(params.region) === -1) {
            return undefined;
        }
    }

    if (this.endpoint.requiresApiKey === false) {
        delete params.api_key;
    } else if (!params.api_key) {
        params.api_key = this.apiKey;
    }

    path = path.trim();
    if (path.indexOf("/") !== 0) {
        path = "/" + path;
    }

    var baseUrl = this.endpoint.baseUrl ? this.endpoint.baseUrl : "https://" + params.region + ".api.pvp.net";
    switch (this.endpoint.name) {
        case "champion":
        case "game":
        case "league":
        case "match":
        case "matchhistory":
        case "matchlist":
        case "stats":
        case "summoner":
        case "team":
            return params.region && baseUrl + "/api/lol/" + params.region + "/" + (this.overrideEndpointVersion || this.endpoint.version) + "/" + this.endpoint.name + this.getCanonicalPathAndQuery(path, params, "region");
        case "lol-static-data":
            return params.region && baseUrl + "/api/lol/static-data/" + params.region + "/" + (this.overrideEndpointVersion || this.endpoint.version) + this.getCanonicalPathAndQuery(path, params, "region");
        case "current-game":
        case "featured-games":
        case "lol-status":
        default:
            return undefined; // Not implemented endpoints
    }
};

RiotApi.prototype.request = function(path, params, callback, cache, ttl) {
    if (typeof params === "function") {
        ttl = ttl || cache;
        cache = cache || callback;
        callback = params;
        params = undefined;
    }
    
    if (typeof cache === "number") {
        ttl = cache;
        cache = true;
    }
    
    if (typeof cache === "undefined") {
        cache = true;
    }

    var url = this.getUrl(path, params);
    if (!url) {
        callback(new Error("Not Supported"));
        return;
    }

    var fetchData = function(retry) {
        async.parallel(limiters.map(function(limiter, index) {
            return function(callback) {
                limiter.removeTokens(1, function(err, remainingRequests) {
                    callback(null, remainingRequests);
                });
            };
        }), function(error, results) {
            request(url, function(error, response, body) {
                if (!error && response.statusCode === 200) {
                    if (cache) {
                        redis.set(url, body);
                        redis.expire(url, ttl || 24 * 60 * 60);
                    }
                    callback(null, JSON.parse(body));
                } else if (!retry && response.statusCode === 503) {
                    setTimeout(fetchData, 2 * 1000, true);
                } else if (response.statusCode === 429) {
                    setTimeout(fetchData, parseInt(response.headers["retry-after"] * 1000));
                } else {
                    try {
                        var json = JSON.parse(body);
                        callback(error || (json && json.status && new Error(json.status.message)), json);
                    } catch (e) {
                        callback(error || new Error("Unknown error"), body);
                    }
                }
            });
        });
    };

    if (cache) {
        redis.get(url, function(err, reply) {
            if (reply) {
                callback(null, JSON.parse(reply));
            } else {
                fetchData();
            }
        });
    } else {
        fetchData();
    }
};

exports = module.exports = RiotApi;

exports.init = function(endpointName, apiKey, overrideEndpointVersion) {
    return new RiotApi(endpointName, apiKey, overrideEndpointVersion);
};