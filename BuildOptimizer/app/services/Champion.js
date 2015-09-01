angular.module("BuildOptimizer").factory("Champion", ["$resource", "$http", "API_BASE_URL", function($resource, $http, apiBaseUrl) {
    return $resource(apiBaseUrl + "lol-static-data/:region/champion/:championId", { region: "na" }, {
        query: {
            method: "GET",
            params: {},
            isArray: true,
            transformResponse: [].concat($http.defaults.transformResponse).concat(function(data, headersGetter, status) {
                return Object.keys(data.data).map(function(key) {
                    return data.data[key];
                }).sort(function(a, b) {
                    return a.name > b.name;
                });
            })
        },
        get: {
            method: "GET",
            params: {},
            //transformResponse: [].concat($http.defaults.transformResponse).concat(function(data, headersGetter, status) {
            //    return Object.keys(data.data).map(function(key) {
            //        return data.data[key];
            //    }).sort(function(a, b) {
            //        return a.name > b.name;
            //    });
            //})
        }
    });
}]);