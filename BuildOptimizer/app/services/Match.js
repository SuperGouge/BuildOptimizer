angular.module("BuildOptimizer").factory("Match", ["$resource", "API_BASE_URL", function($resource, apiBaseUrl) {
    return $resource(apiBaseUrl + "match/:region/:matchId");
}]);