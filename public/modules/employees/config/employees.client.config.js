'use strict';

// Configuring the Articles module
angular.module('employees').run(['Menus',
    'Localization',
	function(Menus, Localization) {
        var local = Localization;
        var lang = local.lang;
		// Set top bar menu items
		Menus.addMenuItem('topbar', local.menuEmployeeManagement[lang], 'employees', 'dropdown', '/employees(/create)?(/types)?', 'male', 4, false, 3);
		Menus.addSubMenuItem('topbar', 'employees', local.menuEmployees[lang], 'employees', undefined, false, 18);
		Menus.addSubMenuItem('topbar', 'employees', local.menuAddEmployee[lang], 'employees/create', undefined, false, 20);
        Menus.addSubMenuItem('topbar', 'employees', 'List Employee Types', 'employees/types/listing', undefined, false, 29);
        Menus.addSubMenuItem('topbar', 'employees', 'Create Employee Types', 'employees/types/create', undefined, false, 30);
	}
]);