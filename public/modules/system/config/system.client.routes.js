'use strict';

//Setting up route
angular.module('system').config(['$stateProvider',
	function($stateProvider) {
		// System state routing
		$stateProvider.
		state('kyc-management', {
			url: '/kyc-management',
			templateUrl: 'modules/system/views/kyc-management.client.view.html'
		}).
		state('system', {
			url: '/system',
			templateUrl: 'modules/system/views/system.client.view.html'
		});
	}
]);