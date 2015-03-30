'use strict';

angular.module('core').directive('shouldRender', ['Localization',
	function(Localization) {
		return {
			restrict: 'A',
			link: function postLink(scope, element, attrs) {
                var found = false;
                for (var userRoleIndex in scope.user.role) {
                    if (parseInt(attrs.shouldRender) === parseInt(scope.user.role[userRoleIndex].priv_id)) {
                        found = true;
//                        scope.title = scope.user.role[userRoleIndex][Localization.lang];
                        console.log(attrs.showTitleIn);
                        window.jQuery(element).find(attrs.showTitleIn).html(scope.user.role[userRoleIndex][Localization.lang]);
                    }
                }
                if(!found){
                    if(attrs.showIt!=='true') {
                        element.remove();
                    }
                } else {
                    if(attrs.showIt==='true') {
                        element.remove();
                    }
                }
            }
		};
	}
]);