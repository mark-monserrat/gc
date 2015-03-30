'use strict';

// Transactions controller
angular.module('transactions').controller('TransactionsController', [
    '$scope',
    '$rootScope',
    '$stateParams',
    '$location',
    '$timeout',
    '$resource',
    '$modal',
    '$http',
    'Authentication',
    'Transactions',
    'Members',
    'Localization',
    'Partners',
    'blockUI',
    function($scope, $rootScope, $stateParams, $location, $timeout, $resource, $modal, $http, Authentication, Transactions, Members, Localization, Partners, blockUI ) {
		$scope.authentication = Authentication;
        $scope.local = Localization;
        $scope.lang = Localization.lang;

        $rootScope.parseFloat = function(value){
            if(parseFloat(value)-parseFloat(value)!==0) value = 0;
            console.log(value);
            return parseFloat(value);
        };

        $scope.statuses = [
            {
                value : Localization.StatusApproved[Localization.lang],
                label : Localization.StatusApproved[Localization.lang]
            },
            {
                value : Localization.StatusPending[Localization.lang],
                label : Localization.StatusPending[Localization.lang]
            },
            {
                value : Localization.StatusRejected[Localization.lang],
                label : Localization.StatusRejected[Localization.lang]
            }
        ];

        $scope.microfinancing_partners = Partners.query({
            partner_type: $scope.local.MicroFinance.en_us
        });

        $scope.remittance_partners = Partners.query({
            partner_type: $scope.local.Remittance.en_us
        });

        $scope.findTopUps = function(){
            $scope.transaction_type = 'TOPUP';
            $scope.status = Localization.StatusPending.en_us;
            $scope.statusFilter();
        };

        $scope.findCardTopUps = function(){
            $scope.transaction_type = 'CARD-TOPUP';
            $scope.status = Localization.StatusPending.en_us;
            $scope.statusFilter();
        };

        $scope.showTopUPFORM = function(){
            var modalInstance = $modal.open({
                templateUrl: 'TopUP',
                controller: TopUpCtrl,
                resolve: {
                    data: function () {
                        return {};
                    }
                }
            });

            modalInstance.result.then(function (data) {
                console.log(data);
                $http.post('/transactions/cardtopup', data).success(function(response) {
                    $scope.findCardTopUps();
                }).error(function(response) {
                    $scope.error = response.message;
                });
            }, function () {
            });
        };

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

        $scope.approve = function(){
            angular.forEach($scope.transactions, function(transaction){
                if($scope.checkboxes[transaction._id]===true && String(transaction.status)==='Pending'){
                    $scope.update(transaction,Localization.StatusApproved.en_us);
                }
            });
        };

        $scope.decline = function(){
            angular.forEach($scope.transactions, function(transaction){
                if($scope.checkboxes[transaction._id]===true && String(transaction.status)==='Pending'){
                    $scope.update(transaction,Localization.StatusRejected.en_us);
                }
            });
        };

        $scope.findRemittances = function(){
            $scope.transaction_type = 'REMITTANCE';
            $scope.status = Localization.StatusPending.en_us;
            $scope.statusFilter();
        };

        $scope.findPayBills = function(){
            $scope.transaction_type = 'BILLS PAYMENT';
            $scope.status = Localization.StatusPending.en_us;
            $scope.statusFilter();
        };

        $scope.findLoans = function(){
            $scope.transaction_type = 'LOAN PAYMENT';
            $scope.status = Localization.StatusPending.en_us;
            $scope.statusFilter();
        };

        $scope.statusFilter = function(){
            var Counter = $resource('/transactions/count',{
                transaction_type : $scope.transaction_type,
                status : $scope.status,
                partner_name: $scope.partner_name
            },{
                query : {method:'GET', isArray:false}
            });

            $scope.populate = function(){
                var member = $scope.selectedPerson ? $scope.selectedPerson.originalObject._id : null;
                Transactions.query({
                    wildcard_search : $scope.wildcard_search,
                    page : $scope.currentPage,
                    sort: $scope.sort,
                    by : $scope.by,
                    transaction_type : $scope.transaction_type,
                    status : $scope.status,
                    partner: $scope.partner,
                    member: member,
                    transaction_date_from: $scope.transaction_date_from,
                    transaction_date_to: $scope.transaction_date_to
                }, function(transactions){
                    $scope.transactions = transactions;

                    angular.forEach($scope.transactions, function(transaction){
                        $scope.checkboxes[transaction._id] = false;
                    });
                });
                $timeout(function() {
                    blockUI.stop();
                },0);
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

        // Create new Transaction
        $scope.create = function() {
            // Create new Transaction object
            var transaction = new Transactions ({
                name: this.name
            });

            // Redirect after save
            transaction.$save(function(response) {
                $location.path('transactions/' + response._id);
            }, function(errorResponse) {
                $scope.error = errorResponse.data.message;
            });

            // Clear form fields
            this.name = '';
        };

		// Remove existing Transaction
		$scope.remove = function( transaction ) {
			if ( transaction ) { transaction.$remove();

				for (var i in $scope.transactions ) {
					if ($scope.transactions [i] === transaction ) {
						$scope.transactions.splice(i, 1);
					}
				}
			} else {
				$scope.transaction.$remove(function() {
					$location.path('transactions');
				});
			}
		};

		// Update existing Transaction
        $scope.update = function(transaction,status){
            if(transaction){
                transaction.status = status;
                transaction.$update(function() {
                    $scope.statusFilter();
                }, function(errorResponse) {
                    $scope.error = errorResponse.data.message;
                });
            }
        };

		// Find a list of Transactions
		$scope.find = function() {
			$scope.transactions = Transactions.query();
		};

		// Find existing Transaction
		$scope.findOne = function() {
			$scope.transaction = Transactions.get({
				transactionId: $stateParams.transactionId
			});
		};

        $scope.members = Members.query();

        var TopUpCtrl = function ($scope, $modalInstance, data) {

            $scope.local = Localization;
            $scope.lang = Localization.lang;

            $scope.member = {};

            $scope.populateCardNbr = function(member){
                console.log(member);
                $scope.data.CardNbr = member.CardNbr;
                $scope.data.member = member._id;
            };

            $scope.members = Members.query({
                hasCardNumber: true
            });

            $scope.data = data;

            $scope.ok = function () {
                $scope.modal_is_submitted = !$scope.modal_is_submitted;
                if($scope.frmTopup.$valid){
                    $modalInstance.close($scope.data);
                }
            };
        };

        var ModalTransCtrl = function ($scope, $modalInstance, data) {

            $scope.local = Localization;
            $scope.lang = Localization.lang;

            $scope.data = data;

            $scope.ok = function () {
                $modalInstance.close();
            };
        };

        $scope.open_transaction = function (transaction) {
            var modalInstance = $modal.open({
                templateUrl: 'TransactionDetails',
                controller: ModalTransCtrl,
                resolve: {
                    data: function () {
                        return transaction;
                    }
                }
            });

            modalInstance.result.then(function (data) {
            }, function () {
            });
        };
	}
]);