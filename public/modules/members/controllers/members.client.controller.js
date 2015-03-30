'use strict';
angular.module('members').controller('MembersController', [
    '$scope',
    '$rootScope',
    '$stateParams',
    '$location',
    'Authentication',
    'Members',
    'Localization',
    'Countries',
    'Partners',
    'Beneficiaries',
    'Employees',
    'Billers',
    '$modal',
    '$timeout',
    '$http',
    '$resource',
    function($scope, $rootScope, $stateParams, $location, Authentication, Members, Localization, Countries, Partners, Beneficiaries, Employees, Billers, $modal ,$timeout, $http, $resource) {
        $rootScope.local = Localization;
        $rootScope.lang = $scope.local.lang;

        $scope.authentication = Authentication;

        $scope.active = 1;

        var ModalInstanceCtrl = function ($scope, $modalInstance, data) {

            $scope.countries = Countries.query();
            $scope.data = data;

            $scope.banks = [
                {
                    name: 'BDO'
                },
                {
                    name: 'BPI'
                }
            ];

            $scope.ok = function () {
                $scope.modal_is_submitted = !$scope.modal_is_submitted;
                if($scope.frmBeneficiary.$valid){
                    $modalInstance.close($scope.data);
                }
            };

            $scope.cancel = function () {
                $modalInstance.dismiss('cancel');
            };

            $scope.changeCountry = function(countryid){
                console.log(countryid);
                angular.forEach($scope.countries, function(country){
                    if(country._id===countryid){
                        $scope.data.country = country;
                    }
                });
            };
        };

        // Create new Member
        $scope.create = function() {
            $scope.modal_is_submitted = !$scope.modal_is_submitted;

            // Redirect after save
            $scope.member.$save(function(response) {
                $location.path('members/' + response._id);
            }, function(errorResponse) {
                $scope.error = errorResponse.data.message;
                if(errorResponse.data.member){
                    alert(errorResponse.data.message.general);
                    $location.url('members/' + errorResponse.data.member._id+'/edit');
                }
            });
        };

        $scope.init = function(){
            $scope.member = new Members({
                beneficiaries_link : [],
                biller_link : [],
                loans_link : []
            });
            $scope.countries = Countries.query();

            $scope.microfinancing_partners = Partners.query({
                partner_type: $scope.local.MicroFinance.en_us
            });

            $scope.remittance_partners = Partners.query({
                partner_type: $scope.local.Remittance.en_us
            });
        };

        // Remove existing Member
        $scope.remove = function( member ) {
            if ( member ) {

                member.$remove();

                for (var i in $scope.members ) {
                    if ($scope.members [i] === member ) {
                        $scope.members.splice(i, 1);
                    }
                }
            } else {
                $scope.member.$remove(function() {
                    $location.path('members');
                });
            }
        };

        // Remove existing Member
        $scope.removeBen = function( beneficiary ) {
            if (beneficiary ) {
                for(var i in $scope.member.beneficiaries_link){
                    if ($scope.member.beneficiaries_link [i] === beneficiary ) {
                        $scope.member.beneficiaries_link.splice(i, 1);
                    }
                }
            }
        };

        // Remove existing Member
        $scope.removeBil = function( biller ) {
            if (biller) {
                for(var i in $scope.member.biller_link){
                    if ($scope.member.biller_link[i] === biller) {
                        $scope.member.biller_link.splice(i, 1);
                    }
                }
            }
        };

        // Remove existing Loanm
        $scope.removeLoan = function( loan ) {
            if (loan) {
                for(var i in $scope.member.loans_link){
                    if ($scope.member.loans_link[i] === loan) {
                        $scope.member.loans_link.splice(i, 1);
                    }
                }
            }
        };

        // Update existing Member
        $scope.update = function() {
            $scope.modal_is_submitted = !$scope.modal_is_submitted;
            if($scope.frmMember.$valid){
                var member = $scope.member;
                member.$update(function() {
                    $location.path('members/' + member._id);
                }, function(errorResponse) {
                    $scope.error = errorResponse.data.message;
                });
            }
        };

        // Find a list of Members
        $scope.find = function() {
            var Counter = $resource('/members/count',{},{
                query : {method:'GET', isArray:false}
            });

            $scope.populate = function(){
                Members.query({page : $scope.currentPage, sort: $scope.sort, by : $scope.by},function(members){
                    $scope.members = members;
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

        // Find existing Member
        $scope.findOne = function() {
            $scope.member = Members.get({
                memberId: $stateParams.memberId
            });
            $scope.countries = Countries.query();

            $scope.remittance_partners = Partners.query({
                partner_type: $scope.local.Remittance.en_us
            });

            $scope.microfinancing_partners= Partners.query({
                partner_type: $scope.local.MicroFinance.en_us
            });
        };

        $scope.open = function (beneficiary) {

            var modalInstance = $modal.open({
                templateUrl: 'beneficiary_form',
                controller: ModalInstanceCtrl,
                resolve: {
                    data: function () {
                        return beneficiary;
                    }
                }
            });

            modalInstance.result.then(function (data) {
                var found = false;
                angular.forEach($scope.member.beneficiaries_link, function(beneficiary){
                   if(beneficiary===data){
                       found = true;
                   }
                });
                if(!found){
                    $scope.member.beneficiaries_link.push(data);
                }
            }, function () {
            });
        };

        $scope.open_loan = function (loan) {

            var modalInstance = $modal.open({
                templateUrl: 'loanForm',
                controller: ModalInstanceCtrl,
                resolve: {
                    data: function () {
                        return loan;
                    }
                }
            });

            modalInstance.result.then(function (data) {
                if(!$scope.member.loans_link) $scope.member.loans_link = [];
                var found = false;
                angular.forEach($scope.member.loans_link, function(loan){
                   if(loan===data){
                       found = true;
                   }
                });
                if(!found){
                    $scope.member.loans_link.push(data);
                }
            }, function () {
            });
        };

        var ModalBillerCtrl = function ($scope, $modalInstance, data, member) {

            $scope.partner = Partners.get({
                partnerId: member.remittance
            });

            console.log($scope.partner);
            $scope.data = data;

            $scope.ok = function () {
                $scope.modal_is_submitted = !$scope.modal_is_submitted;
                if($scope.frmBiller.$valid){
                    $modalInstance.close($scope.data);
                }
            };

            $scope.cancel = function () {
                $modalInstance.dismiss('cancel');
            };

            $scope.selectBiller = function(billerid){
                angular.forEach($scope.partner.biller_link, function(biller){
                    if(biller._id===billerid){
                        $scope.data.biller = biller;
                    }
                });
            };
        };

        $scope.open_biller = function (biller) {
            console.log($scope.member);
            var modalInstance = $modal.open({
                templateUrl: 'billerForm',
                controller: ModalBillerCtrl,
                resolve: {
                    data: function () {
                        return biller;
                    },
                    member : function(){
                        return $scope.member;
                    }
                }
            });

            modalInstance.result.then(function (data) {
                var found = false;
                angular.forEach($scope.member.biller_link, function(biller){
                   if(biller===data){
                       found = true;
                   }
                });
                if(!found){
                    $scope.member.biller_link.push(data);
                }
            }, function () {
            });
        };

        $scope.generate_password = function(){
            $http.post('/members/reset_password/'+$scope.member._id).success(function(response) {
                alert('Password has been reset');
            }).error(function(response) {
                $scope.error = response.message;
            });
        };
    }
]);

