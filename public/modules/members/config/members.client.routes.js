'use strict';

//Setting up route
angular.module('members').config(['$stateProvider',
	function($stateProvider) {
		// Members state routing
		$stateProvider.
		state('billers-applications', {
			url: '/members/billers-applications',
			templateUrl: 'modules/members/views/billers-applications.client.view.html'
		}).
		state('edit-beneficiary', {
			url: '/edit-beneficiary/:memberId/edit',
			templateUrl: 'modules/members/views/edit-beneficiary.client.view.html'
		}).
		state('beneficiary-applications', {
			url: '/members/beneficiary-applications',
			templateUrl: 'modules/members/views/beneficiary-applications.client.view.html'
		}).
		state('listMembers', {
			url: '/members',
			templateUrl: 'modules/members/views/list-members.client.view.html'
		}).
		state('createMember', {
			url: '/members/create',
			templateUrl: 'modules/members/views/create-member.client.view.html'
		}).
		state('viewMember', {
			url: '/members/:memberId',
            templateUrl: 'modules/members/views/list-members.client.view.html'
		}).
		state('editMember', {
			url: '/members/:memberId/edit',
			templateUrl: 'modules/members/views/edit-member.client.view.html'
		});
	}
]);