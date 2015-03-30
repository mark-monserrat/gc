'use strict';

//Employeetypes service used to communicate Employeetypes REST endpoints
angular.module('employees').factory('Employeetypes', ['$resource',
	function($resource) {
		return $resource('employeetypes/:employeetypeId', { employeetypeId: '@_id'
		}, {
			update: {
				method: 'PUT'
			}
		});
	}
]);