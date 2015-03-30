'use strict';

angular.module('members').controller('BeneficiaryApplicationsController', [
    '$scope',
    '$rootScope',
    '$location',
    '$stateParams',
    '$resource',
    '$modal',
    'Localization',
    'Beneficiaries',
    'Countries',
    'Authentication',
	function($scope, $rootScope, $location, $stateParams, $resource, $modal, Localization, Beneficiaries, Countries, Authentication) {
        $rootScope.local = Localization;
        $rootScope.lang = $scope.local.lang;
        $scope.authentication = Authentication;

        $scope.list = function(){
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

            var Counter = $resource('/beneficiaries/count',{
                status : $scope.status
            },{
                query : {method:'GET', isArray:false}
            });

            $scope.populate = function(){
                Beneficiaries.query({
                    page : $scope.currentPage,
                    sort: $scope.sort,
                    by : $scope.by,
                    status : $scope.status
                },function(members){
                    console.log(members);
                    $scope.beneficiaries = members;
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

        $scope.statusFilter = function(){
            $scope.beneficiaries = Beneficiaries.query({
                status : $scope.status
            });
        };

        $scope.findOne = function(){
            $scope.countries = Countries.query();
            $scope.beneficiary = Beneficiaries.get({
                beneficiaryId: $stateParams.memberId
            });
        };

        $scope.update = function(beneficiary, status){
            if(beneficiary){
                beneficiary.status = status;
                beneficiary.$update(function() {
                    $scope.statusFilter();
                }, function(errorResponse) {
                    $scope.error = errorResponse.data.message;
                });
            } else {
                $scope.beneficiary.$update(function() {
                    $location.path('members/beneficiary-applications');
                }, function(errorResponse) {
                    $scope.error = errorResponse.data.message;
                });
            }
        };

        // Remove existing Member
        $scope.remove = function( beneficiary ) {
            if ( beneficiary ) {

                beneficiary.$remove();

                for (var i in $scope.beneficiaries ) {
                    if ($scope.beneficiaries [i] === beneficiary ) {
                        $scope.beneficiaries.splice(i, 1);
                    }
                }
            } else {
                $scope.beneficiaries.$remove(function() {
                    $location.path('members/beneficiary-applications');
                });
            }
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

        $scope.open_beneficiary = function (beneficiary) {
            var modalInstance = $modal.open({
                templateUrl: 'BeneficiaryDetails',
                controller: ModalCtrl,
                resolve: {
                    data: function () {
                        return beneficiary;
                    }
                }
            });

            modalInstance.result.then(function (data) {
            }, function () {
            });
        };
    }
]);