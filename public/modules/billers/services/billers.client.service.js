'use strict';

//Billers service used to communicate Billers REST endpoints
angular.module('billers').factory('Billers', ['$resource',
	function($resource) {
		return $resource('billers/:billerId', { billerId: '@_id'
		}, {
			update: {
				method: 'PUT'
			}
		});
	}
]);