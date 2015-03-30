'use strict';

angular.module('system').controller('KycManagementController', [
    '$scope',
    '$rootScope',
    '$resource',
    '$http',
    '$modal',
    'Members',
    'Authentication',
    'Localization',
    'KycSending',
	function($scope, $rootScope, $resource, $http, $modal, Members, Authentication, Localization, KycSending) {
        $rootScope.local = Localization;
        $rootScope.lang = $scope.local.lang;

        $scope.authentication = Authentication;

        $rootScope.reloadAll = false;

        $scope.find = function(status){
            var count_resource;
            if(status==='Sent'){
                count_resource = '/kyc-sending/count';
            } else {
                count_resource = '/members/count';
            }
            var Counter = $resource(count_resource,{KYCStatus:status},{
                query : {method:'GET', isArray:false}
            });

            $scope.populate = function(){
                var Model = status === 'Sent' ? KycSending : Members;
                Model.query({KYCStatus:status, page : $scope.currentPage, sort: $scope.sort, by : $scope.by},function(results){
                    $scope.results = results;
                    angular.forEach($scope.results, function(result){
                        $scope.checkboxes[result._id] = false;
                    });
                    $rootScope.reloadAll = false;
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

        $rootScope.$watch('reloadAll', function(value){
            if(value){
                $scope.populate();
            }
        });

        $scope.checkboxes = {};
        $scope.checkAll = function(){
            angular.forEach($scope.checkboxes, function(checkbox, value){
                $scope.checkboxes[value] = $scope.checkall;
            });
        };

        $scope.isCheckedAll = function(){
            var found = true;
            angular.forEach($scope.checkboxes, function(checkbox, value){
                if(!checkbox){
                    found = false;
                }
            });
            var ret = $scope.checkall = found;
            return ret;
        };

        $scope.sendBatch = function(){
            $http.post('/members/sendbatch/',$scope.checkboxes).success(function(response) {
                if(response.result==='ok'){
                    alert('KYC has been sent.');
                } else {
                    alert('Theres an error in member. KYC Not sent');
                }
                $rootScope.reloadAll = true;
            }).error(function(response) {
                $scope.error = response.message;
            });
        };

        $scope.resendBatch = function(){
            $http.post('/members/resendbatch/',$scope.checkboxes).success(function(response) {
                if(response.result==='ok'){
                    alert('KYC has been sent.');
                } else {
                    alert('Theres an error in member. KYC Not sent');
                }
                $rootScope.reloadAll = true;
            }).error(function(response) {
                $scope.error = response.message;
            });
        };

        $scope.setOnHold = function(){
            $http.post('/members/onhold/',$scope.checkboxes).success(function(response) {
                if(response.result==='ok'){
                    alert('KYC has been hold.');
                } else {
                    alert('Theres an error in member. KYC Not hold');
                }
                $rootScope.reloadAll = true;
            }).error(function(response) {
                $scope.error = response.message;
            });
        };

        $scope.openBatchDetails = function(batch){
            var modalInstance = $modal.open({
                templateUrl: 'BatchDetails',
                controller: ModalCtrl,
                resolve: {
                    data: function () {
                        return batch;
                    }
                }
            });

            modalInstance.result.then(function (data) {
            }, function () {
            });
        };
        var ModalCtrl = function ($scope, $modalInstance, data) {

            $scope.data = data;

            $scope.ok = function () {
                $modalInstance.close($scope.data);
            };

            $scope.cancel = function () {
                $modalInstance.dismiss('cancel');
            };
        };
	}
]);