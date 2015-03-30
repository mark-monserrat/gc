'use strict';

//Beneficiaries service used to communicate Beneficiaries REST endpoints
angular.module('members').factory('Beneficiaries', ['$resource',
	function($resource) {
		return $resource('beneficiaries/:beneficiaryId', {
            beneficiaryId: '@_id'
		}, {
			update: {
				method: 'PUT'
			}
		});
	}
]);