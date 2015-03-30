'use strict';

// Billers controller
angular.module('members').controller('BillersApplicationController', [
    '$scope',
    '$stateParams',
    '$location',
    '$resource',
    '$modal',
    'Authentication',
    'Memberbiller',
    'Localization',
	function($scope, $stateParams, $location, $resource, $modal, Authentication, Memberbiller, Localization) {
        $scope.local = Localization;
        $scope.lang = $scope.local.lang;

		$scope.authentication = Authentication;

		// Remove existing Biller
		$scope.remove = function( biller ) {
			if ( biller ) {
                biller.$remove();

				for (var i in $scope.billers ) {
					if ($scope.billers [i] === biller ) {
						$scope.billers.splice(i, 1);
					}
				}
			} else {
				$scope.biller.$remove(function() {
					$location.path('billers');
				});
			}
		};

		// Update existing Biller
		$scope.update = function(biller, status) {
            if(biller){
                biller.status = status;
                biller.$update(function() {
                    $scope.statusFilter();
                }, function(errorResponse) {
                    $scope.error = errorResponse.data.message;
                });
            } else {
                $scope.biller.$update(function() {
                    $location.path('members/billers-applications');
                }, function(errorResponse) {
                    $scope.error = errorResponse.data.message;
                });
            }
		};

        $scope.statusFilter = function(){
            $scope.billers = Memberbiller.query({
                status : $scope.status
            });
        };

		// Find a list of Billers
		$scope.find = function() {
            $scope.statuses = [
                {
                    value : Localization.StatusApproved.en_us,
                    label : Localization.StatusApproved[Localization.lang]
                },
                {
                    value : Localization.StatusPending.en_us,
                    label : Localization.StatusPending[Localization.lang]
                },
                {
                    value : Localization.StatusRejected.en_us,
                    label : Localization.StatusRejected[Localization.lang]
                }
            ];
            $scope.status = Localization.StatusPending.en_us;

            var Counter = $resource('/memberbiller/count',{
                status : $scope.status
            },{
                query : {method:'GET', isArray:false}
            });

            $scope.populate = function(){
                Memberbiller.query({
                    page : $scope.currentPage,
                    sort: $scope.sort,
                    by : $scope.by,
                    status : $scope.status
                }, function(billers){
                    $scope.billers = billers;
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

		// Find existing Biller
		$scope.findOne = function() {
			$scope.biller = Memberbiller.get({
				memberbillerId: $stateParams.memberId
			});
		};

        var ModalCtrl = function ($scope, $modalInstance, data) {

            $scope.local = Localization;
            $scope.lang = Localization.lang;

            $scope.data = data;

            $scope.ok = function () {
                $modalInstance.close();
            };
        };

        $scope.open_member = function (member) {
            var modalInstance = $modal.open({
                templateUrl: 'MemberDetails',
                controller: ModalCtrl,
                resolve: {
                    data: function () {
                        return member;
                    }
                }
            });

            modalInstance.result.then(function (data) {
            }, function () {
            });
        };
	}
]);