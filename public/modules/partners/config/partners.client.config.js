'use strict';

// Configuring the Articles module
angular.module('partners').run(['Menus','Localization',
	function(Menus, Localization) {
        var local = Localization;
        var lang = local.lang;

		// Set top bar menu items
		Menus.addMenuItem('topbar', local.menuPartnersManagement[lang], 'partners', 'dropdown', '/partners(/create)?', 'bank', 2, false, 1);
		Menus.addSubMenuItem('topbar', 'partners', local.menuPartners[lang], 'partners', undefined, false, 7);
		Menus.addSubMenuItem('topbar', 'partners', local.menuAddPartner[lang], 'partners/create', undefined, false, 8);
	}
]);