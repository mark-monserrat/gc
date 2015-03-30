'use strict';


angular.module('core').controller('HomeController', [
    '$scope',
    '$stateParams',
    '$location',
    '$timeout',
    '$resource',
    'Authentication',
    'Transactions',
    'Localization',
    'blockUI',
    function($scope, $stateParams, $location, $timeout, $resource, Authentication, Transactions, Localization, blockUI ) {
        $scope.authentication = Authentication;
        $scope.local = Localization;
        $scope.lang = Localization.lang;

        $scope.statuses = [
            {
                value : 'Active',
                label : Localization.StatusApproved[Localization.lang]
            },
            {
                value : 'Pending',
                label : Localization.StatusPending[Localization.lang]
            },
            {
                value : 'Rejected',
                label : Localization.StatusRejected[Localization.lang]
            }
        ];

        $scope.findTopUps = function(){
            $scope.statusFilter_topup = new StatusFilter('TOPUP', 'Pending');
        };

        $scope.findRemittances = function(){
            $scope.StatusFilter_remittance = new StatusFilter('REMITTANCE', 'Active');
        };

        $scope.findPayBills = function(){
            $scope.StatusFilter_bills_payment = new StatusFilter('BILLS PAYMENT', 'Active');
        };

        $scope.findLoans = function(){
            $scope.StatusFilter_loan_payment = new StatusFilter('LOAN PAYMENT', 'Pending');
        };

        $scope.transactions = {};
        var StatusFilter = function(transaction_type){
            var populate = function(){
                Transactions.query({
                    sort: 'date_created',
                    by : false,
                    limit : 5,
                    transaction_type : transaction_type
                }, function(transactions){
                    $scope.transactions[transaction_type] = transactions;
                    $timeout(function(){
                        blockUI.stop();
                    },1);
                });
            };
            populate();
        };

        $scope.pagewraper = true;
	}
]);