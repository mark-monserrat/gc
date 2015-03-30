'use strict';

// System module config
angular.module('system').run([
    'Menus',
    'Localization',
	function(Menus, Localization) {

        var local = Localization;
        var lang = local.lang;
        // Set top bar menu items
        Menus.addMenuItem('topbar', local.menuSystem[lang], 'system', 'dropdown', '/system(/create)?(/types)?', 'male', 4, false, 31);
        Menus.addSubMenuItem('topbar', 'system', local.menuAuditTrails[lang], 'system', undefined, false, 32);
        Menus.addSubMenuItem('topbar', 'system', local.menuKYCManagement[lang], 'kyc-management', undefined, false, 40);
	}
]);