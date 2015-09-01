angular.module("BuildOptimizer").controller("ChampionCtrl", [
    "$scope", "$routeParams", "$location", "Champion", "Pro", "Match", "Version", function($scope, $routeParams, $location, Champion, Pro, Match, Version) {
        $scope.version = "5.17.1";
        Version.query(function(result) {
            $scope.version = result[0];
        });

        $scope.champion = Champion.get({ championId: $routeParams.championId }, function(result) {
            $scope.champion = result.toJSON();
        });

        $scope.matches = [];
        Pro.query({ championId: $routeParams.championId }, function(result) {
            var latestMatches = result.sort(function(a, b) {
                return a.timestamp < b.timestamp;
            });
            if (latestMatches.length > 12) {
                latestMatches = latestMatches.slice(0, 12);
            }
            angular.forEach(latestMatches, function(match) {
                Match.get({ region: match.region, matchId: match.matchId }, function(result) {
                    result = result.toJSON();
                    var matchDto = { region: match.region, matchId: match.matchId };
                    for (var i = 0; i < result.participantIdentities.length; i++) {
                        if (result.participantIdentities[i].player.summonerId === match.summonerId) {
                            matchDto.participantId = i + 1;
                            matchDto.player = result.participantIdentities[i].player;
                            matchDto.data = result.participants[i];
                            break;
                        }
                    }
                    $scope.matches.push(matchDto);
                });
            });
        });

        $scope.selectMatch = function(match) {
            $location.path("/" + match.region + "/match/" + match.matchId + "/summoner/" + match.player.summonerId);
        };
    }
]);