angular.module("BuildOptimizer").factory("Pro", ["$resource", "API_BASE_URL", function($resource, apiBaseUrl) {
    return $resource(apiBaseUrl + "pro/:championId");
}]);