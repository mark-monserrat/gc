'use strict';

//Setting up route
angular.module('transactions').config(['$stateProvider',
	function($stateProvider) {
		// Transactions state routing
		$stateProvider.
		state('card-topups', {
			url: '/transactions/card-topups',
			templateUrl: 'modules/transactions/views/card-topups.client.view.html'
		}).
		state('list-remittances', {
			url: '/transactions/list-remittances',
			templateUrl: 'modules/transactions/views/list-remittances.client.view.html'
		}).
		state('list-topups', {
			url: '/transactions/list-topups',
			templateUrl: 'modules/transactions/views/list-topups.client.view.html'
		}).
		state('list-loanpayments', {
			url: '/transactions/list-loanpayments',
			templateUrl: 'modules/transactions/views/list-loanpayments.client.view.html'
		}).
		state('list-billpayments', {
			url: '/transactions/list-billpayments',
			templateUrl: 'modules/transactions/views/list-billpayments.client.view.html'
		});
	}
]);