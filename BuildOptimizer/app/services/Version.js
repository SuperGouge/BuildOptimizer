angular.module("BuildOptimizer").factory("Version", ["$resource", "$http", "API_BASE_URL", function($resource, $http, apiBaseUrl) {
    return $resource(apiBaseUrl + "lol-static-data/:region/versions", { region: "na" });
}]);