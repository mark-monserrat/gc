'use strict';

//Setting up route
angular.module('billers').config(['$stateProvider',
	function($stateProvider) {
		// Billers state routing
		$stateProvider.
		state('listBillers', {
			url: '/billers',
			templateUrl: 'modules/billers/views/list-billers.client.view.html'
		}).
		state('createBiller', {
			url: '/billers/create',
			templateUrl: 'modules/billers/views/create-biller.client.view.html'
		}).
		state('viewBiller', {
			url: '/billers/:billerId',
			templateUrl: 'modules/billers/views/view-biller.client.view.html'
		}).
		state('editBiller', {
			url: '/billers/:billerId/edit',
			templateUrl: 'modules/billers/views/edit-biller.client.view.html'
		});
	}
]);