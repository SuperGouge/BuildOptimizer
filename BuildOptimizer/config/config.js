var secret = require("./secret");

module.exports = {
    port: 1337,
    redis: {
        host: "BuildOptimizer.redis.cache.windows.net",
        port: 6379,
        key: secret.redis.key
    },
    debug: "BuildOptimizer:*",
    riotApiKey: secret.riotApiKey
};