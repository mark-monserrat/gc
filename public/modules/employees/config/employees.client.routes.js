'use strict';

//Setting up route
angular.module('employees').config(['$stateProvider',
	function($stateProvider) {
		// Employees state routing
		$stateProvider.
		state('listEmployees', {
			url: '/employees',
			templateUrl: 'modules/employees/views/list-employees.client.view.html'
		}).
		state('createEmployee', {
			url: '/employees/create',
			templateUrl: 'modules/employees/views/create-employee.client.view.html'
		}).
		state('viewEmployee', {
			url: '/employees/:employeeId',
            templateUrl: 'modules/employees/views/list-employees.client.view.html'
		}).
		state('editEmployee', {
			url: '/employees/:employeeId/edit',
			templateUrl: 'modules/employees/views/edit-employee.client.view.html'
		}).
        state('listEmployeetypes', {
            url: '/employees/types/listing',
            templateUrl: 'modules/employees/views/list-employeetypes.client.view.html'
        }).
        state('createEmployeetype', {
            url: '/employees/types/create',
            templateUrl: 'modules/employees/views/create-employeetype.client.view.html'
        }).
        state('viewEmployeeType', {
            url: '/employees/types/listing/:employeeId',
            templateUrl: 'modules/employees/views/list-employeetypes.client.view.html'
        }).
        state('editEmployeetype', {
            url: '/employees/types/:employeetypeId/edit',
            templateUrl: 'modules/employees/views/edit-employeetype.client.view.html'
        });
	}
]);