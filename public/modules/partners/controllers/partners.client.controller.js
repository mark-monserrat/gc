'use strict';

// Partners controller
angular.module('partners').controller('PartnersController', [
    '$scope',
    '$rootScope',
    '$stateParams',
    '$location',
    '$resource',
    'Authentication',
    'Partners',
    'Localization',
    'Countries',
    '$modal',
	function($scope, $rootScope, $stateParams, $location, $resource, Authentication, Partners, Localization, Countries, $modal ) {
        $rootScope.local = Localization;
        $rootScope.lang = $scope.local.lang;

		$scope.authentication = Authentication;

        var ModalInstanceCtrl = function ($scope, $modalInstance, data) {

            $scope.data = data;

            $scope.ok = function () {
                $modalInstance.close($scope.data);
            };

            $scope.cancel = function () {
                $modalInstance.dismiss('cancel');
            };
        };

		// Create new Partner
		$scope.create = function() {
            $scope.modal_is_submitted = !$scope.Modal_is_submitted;
			$scope.partner.$save(function(response) {
				$location.path('partners/' + response._id);
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

        $scope.init = function(){
            $scope.countries = Countries.query();
            $scope.partner = new Partners({
                payout_method : [],
                biller_link : []
            });
        };

		// Remove existing Partner
		$scope.remove = function( partner ) {
			if ( partner ) { partner.$remove();

				for (var i in $scope.partners ) {
					if ($scope.partners [i] === partner ) {
						$scope.partners.splice(i, 1);
					}
				}
			} else {
				$scope.partner.$remove(function() {
					$location.path('partners');
				});
			}
		};

		// Remove existing Payout Method
		$scope.removePayoutMethod = function( method ) {
			if ( method ) {
				for (var i in $scope.partner.payout_method ) {
					if ($scope.partner.payout_method [i] === method ) {
						$scope.partner.payout_method.splice(i, 1);
					}
				}
			}
		};

		// Update existing Partner
		$scope.update = function() {
            $scope.modal_is_submitted = !$scope.modal_is_submitted;
            if($scope.frmPartner.$valid){
                var partner = $scope.partner ;
                partner.$update(function() {
                    $location.path('partners/' + partner._id);
                }, function(errorResponse) {
                    $scope.error = errorResponse.data.message;
                });
            }
		};

		// Find a list of Partners
		$scope.find = function() {
            var Counter = $resource('/partners/count',{},{
                query : {method:'GET', isArray:false}
            });

            $scope.populate = function(){
                Partners.query({
                    page : $scope.currentPage,
                    sort: $scope.sort,
                    by : $scope.by,
                    status : $scope.status
                }, function(partners){
                    $scope.partners = partners;
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

		// Find existing Partner
		$scope.findOne = function() {
            $scope.countries = Countries.query();
			$scope.partner = Partners.get({ 
				partnerId: $stateParams.partnerId
			});
		};

        $scope.open = function (method) {
            var modalInstance = $modal.open({
                templateUrl: 'payoutMethodForm',
                controller: ModalInstanceCtrl,
                resolve: {
                    data: function () {
                        return method;
                    }
                }
            });

            modalInstance.result.then(function (data) {
                var found = false;
                angular.forEach($scope.partner.payout_method, function(method){
                    if(method===data){
                        found = true;
                    }
                });
                if(!found){
                    $scope.partner.payout_method.push(data);
                }
            }, function () {
            });
        };

        $scope.openBillerForm = function (biller) {

            var modalInstance = $modal.open({
                templateUrl: 'billerForm',
                controller: ModalInstanceCtrl,
                resolve: {
                    data: function () {
                        return biller;
                    }
                }
            });

            modalInstance.result.then(function (data) {
                if(data._id===undefined){
                    var found = false;
                    angular.forEach($scope.partner.biller_link, function(biller){
                        if(biller===data){
                            found = true;
                        }
                    });
                    if(!found){
                        $scope.partner.biller_link.push(data);
                    }
                }
            }, function () {
            });
        };

        $scope.removeBiller = function(biller){
            for (var i in $scope.partner.biller_link ) {
                if ($scope.partner.biller_link[i] === biller ) {
                    $scope.partner.biller_link.splice(i, 1);
                }
            }
        };

        $scope.changeCountry = function(countryid){
            console.log(countryid);
            angular.forEach($scope.countries, function(country){
                if(country._id===countryid){
                    $scope.partner.country = country;
                }
            });
        };
	}
]);