angular.module("BuildOptimizer").controller("HomeCtrl", [
    "$scope", "$location", "Champion", function($scope, $location, Champion) {
        $scope.loading = true;
        $scope.champions = Champion.query(function(results) {
            $scope.champions = results;
            $scope.loading = false;
        });

        $scope.selectChampion = function(selectedChampion) {
            for (var i = 0; i < $scope.champions.length; i++) {
                var champion = $scope.champions[i];
                if (champion.name === selectedChampion) {
                    $location.path("/champion/" + champion.id);
                }
            }
        }
    }
]);