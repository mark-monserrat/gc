'use strict';

// Reports module config
angular.module('reports').run(['Menus','Localization',
	function(Menus, Localization) {
        var local = Localization;
        var lang = local.lang;
        Menus.addMenuItem('topbar', local.menuReports[lang], 'reports', 'dropdown', '/reports(/create)?', 'folder-open', 5);
	}
]);