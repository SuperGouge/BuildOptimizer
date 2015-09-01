angular.module("BuildOptimizer").controller("MatchCtrl", [
    "$scope", "$routeParams", "$location", "Champion", "Pro", "Match", "Version", "REGIONS", function($scope, $routeParams, $location, Champion, Pro, Match, Version, regions) {
        $scope.version = "5.17.1";
        Version.query(function(result) {
            $scope.version = result[0];
        });

        $scope.match = Match.get({ region: $routeParams.region, matchId: $routeParams.matchId, includeTimeline: true }, function(result) {
            result = result.toJSON();
            var matchDto = { region: $routeParams.region, matchId: $routeParams.matchId };
            for (var i = 0; i < result.participantIdentities.length; i++) {
                if (result.participantIdentities[i].player.summonerId === parseInt($routeParams.summonerId, 10)) {
                    matchDto.participantId = i + 1;
                    matchDto.player = result.participantIdentities[i].player;
                    matchDto.data = result.participants[i];
                }
            }

            matchDto.events = [];
            for (var j = 0; j < result.timeline.frames.length; j++) {
                var frame = result.timeline.frames[j];
                if (frame.events) {
                    for (var k = 0; k < frame.events.length; k++) {
                        var event = frame.events[k];
                        if (event.participantId === matchDto.participantId && event.eventType.indexOf("ITEM_") === 0 && event.eventTyp !== "ITEM_DESTROYED") {
                            matchDto.events.push(event);
                        }
                    }
                }
            }

            matchDto.items = matchDto.events.filter(function(event) {
                return event.eventType === "ITEM_PURCHASED";
            });

            $scope.match = matchDto;
            $scope.champion = Champion.get({ championId: $scope.match.data.championId }, function(result) {
                $scope.champion = result.toJSON();

                var itemSet = {
                    title: $scope.champion.name,
                    type: "custom",
                    map: "SR",
                    mode: "CLASSIC",
                    blocks: [
                    {
                        type: "Starting Items",
                        items: []
                    }, {
                        type: "First Back",
                        items: []
                    }, {
                        type: "Core",
                        items: []
                    }, {
                        type: "Late Game",
                        items: []
                    }]
                };
                
                for (var l = 0; l < matchDto.items.length; l++) {
                    var itemEvent = matchDto.items[l];
                    var item = { id: itemEvent.itemId.toString(), count: 1 };
                    if (itemEvent.timestamp <= 3 * 60 * 1000) {
                        itemSet.blocks[0].items.push(item);
                    } else if (itemEvent.timestamp > 3 * 60 * 1000 && itemEvent.timestamp <= 10 * 60 * 1000) {
                        itemSet.blocks[1].items.push(item);
                    } else if (itemEvent.timestamp > 10 * 60 * 1000 && itemEvent.timestamp <= 25 * 60 * 1000) {
                        itemSet.blocks[2].items.push(item);
                    } else if (itemEvent.timestamp > 25 * 60 * 1000) {
                        itemSet.blocks[3].items.push(item);
                    }
                }

                for (var m = 0; m < itemSet.blocks.length; m++) {
                    var dic = {};
                    var block = itemSet.blocks[m];
                    for (var n = 0; n < block.items.length; n++) {
                        if (dic.hasOwnProperty(block.items[n].id)) {
                            dic[block.items[n].id]++;
                        } else {
                            dic[block.items[n].id] = 1;
                        }
                    }

                    itemSet.blocks[m].items = (function(dic) {
                        return Object.keys(dic).map(function(itemId) {
                            return {
                                id: itemId,
                                count: dic[itemId]
                            };
                        });
                    })(dic);
                }

                $scope.itemSet = itemSet;

                var blob = new Blob([JSON.stringify(itemSet)], { type: "application/json;charset=utf-8;" });
                $scope.url = (window.URL || window.webkitURL).createObjectURL(blob);
            });
        });
    }
]);