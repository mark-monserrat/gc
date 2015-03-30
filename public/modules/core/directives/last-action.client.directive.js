'use strict';

angular.module('core').directive('lastAction', [
    '$resource',
    'Employees',
	function($resource, Employees) {
		return {
			restrict: 'A',
			link: function postLink(scope, element, attrs) {
                Employees.get({
                    employeeId: scope.authentication.user._id
                }, function(employee){
                    var action = attrs.title;
                    var found = false;

                    if(employee.last_action===undefined){
                        employee.last_action = [];
                    }
                    for(var i in employee.last_action){
                        if (employee.last_action[i].Title === action) {
                            employee.last_action.splice(i, 1);
                        }
                    }

                    if(employee.last_action.length===5){
                        employee.last_action.splice(0, 1);
                    }
                    employee.last_action.push({
                        Title: action,
                        Url: attrs.url
                    });

                    employee.$update({
                        employeeId: scope.authentication.user._id
                    },function(){
                        scope.authentication.user = employee;
                    });
                });
			}
		};
	}
]);