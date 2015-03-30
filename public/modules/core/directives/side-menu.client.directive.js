'use strict';
angular.module('core').directive('sideMenu', [
    '$timeout',
	function($timeout) {
		return {
            restrict: 'A',
            link: function postLink(scope, element, attrs) {
                scope.$on('dataloaded',function(){
                    $timeout(function(){
                        element.metisMenu();
                    },100);
                });
            }
		};
	}
]);