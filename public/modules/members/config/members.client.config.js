'use strict';

// Configuring the Articles module
angular.module('members').run(['Menus','Localization',
	function(Menus, Localization) {
        var local = Localization;
        var lang = local.lang;
		// Set top bar menu items
		Menus.addMenuItem('topbar', local.menuMembersManagement[lang], 'members', 'dropdown', '/members(/create)?', 'users', 1, false, 2);
		Menus.addSubMenuItem('topbar', 'members', local.menuMembers[lang], 'members', undefined, false, 10);
		Menus.addSubMenuItem('topbar', 'members', local.menuAddMember[lang], 'members/create', undefined, false, 12);
		Menus.addSubMenuItem('topbar', 'members', local.menuBeneficiaryApplication[lang], 'members/beneficiary-applications', undefined, false, 14);
		Menus.addSubMenuItem('topbar', 'members', local.menuBillersApplication[lang], 'members/billers-applications', undefined, false, 16);
	}
]);