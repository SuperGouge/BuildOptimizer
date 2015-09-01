angular.module("BuildOptimizer")
    .constant("BASE_URL", location.protocol + "//" + location.host)
    .constant("API_BASE_URL", location.protocol + "//" + location.host + "/api/")
    .constant("REGIONS", ["br", "eune", "euw", "kr", "lan", "las", "na", "oce", "ru", "tr"])
    .constant("REGIONS_PBE", ["br", "eune", "euw", "kr", "lan", "las", "na", "oce", "ru", "tr", "pbe"]);