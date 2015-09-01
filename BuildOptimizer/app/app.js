var app = angular.module("BuildOptimizer", ["ngRoute", "ngResource", "ui.bootstrap"]);

app.config(["$routeProvider", function($routeProvider) {
    $routeProvider
        .when("/", { templateUrl: "app/views/home.html", controller: "HomeCtrl" })
        .when("/champion/:championId", { templateUrl: "app/views/champion.html", controller: "ChampionCtrl" })
        .when("/:region/match/:matchId/summoner/:summonerId", { templateUrl: "app/views/match.html", controller: "MatchCtrl" })
        .otherwise({ redirectTo: "/" });
}])
.config(["$compileProvider", function($compileProvider) {
    $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|tel|file|blob):/);
}])
.controller("MainCtrl", ["$scope", "$route", "$routeParams", "$location", function($scope, $route, $routeParams, $location) {
    $scope.$on("$routeChangeSuccess", function(e, current, previous) {
        $scope.location = $location;
        $scope.activeViewPath = $location.path();
    });
}]);
