var config = require("./config");
var redis = require("redis");
var debug = require("debug")("BuildOptimizer:Redis");

var client = redis.createClient(config.redis.port, config.redis.host, { auth_pass: config.redis.key });

client.on("connect", function() {
    debug("Connected to Redis server " + config.redis.host + ":" + config.redis.port);
});

client.on("ready", function() {
    debug("Redis server ready");
});

client.on("error", function(err) {
    debug("Redis error: " + err);
});

client.on("end", function() {
    debug("Redis server disconnected");
});

var shutdown = function() {
    client.quit();
    debug("Redis server disconnected through app termination");
    process.exit(0);
};

process.on("SIGINT", shutdown).on("SIGTERM", shutdown);

module.exports = client;