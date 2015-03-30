'use strict';

angular.module('system').controller('SystemController', [
    '$scope',
    '$resource',
    'AuditTrails',
    'Localization',
	function($scope, $resource, AuditTrails, Localization) {
		$scope.local = Localization;
        $scope.lang = Localization.lang;

        $scope.find = function(){

            var Counter = $resource('/audittrails/count',{},{
                query : {method:'GET', isArray:false}
            });

            $scope.populate = function(){
                AuditTrails.query({
                    page : $scope.currentPage,
                    sort: $scope.sort,
                    by : $scope.by,
                    status : $scope.status
                }, function(audittrails){
                    $scope.audittrails  = audittrails;
                });
            };

            $scope.sortBy = function(field){
                if($scope.sort !== field){
                    $scope.by = true;
                    $scope.sort = field;
                } else {
                    $scope.by = !$scope.by;
                }
                $scope.populate();
            };

            $scope.pageLimit = 10;
            $scope.currentPage = 1;
            Counter.query(function(count){
                $scope.totalItems = count.total;
                $scope.populate();
            });
        };
	}
]);