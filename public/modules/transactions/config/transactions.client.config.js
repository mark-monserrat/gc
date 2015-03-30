'use strict';

// Configuring the Articles module
angular.module('transactions').run(['Menus', 'Localization',
	function(Menus, Localization) {
        var local = Localization;
        var lang = local.lang;
		// Set top bar menu items
		Menus.addMenuItem('topbar', local.menuTransactions[lang], 'transactions', 'dropdown', '/transactions(/create)?', 'exchange', 3, false, 5);
		Menus.addSubMenuItem('topbar', 'transactions', local.menuMicrofinanceLoans[lang], 'transactions/list-loanpayments', undefined, false, 40);
		Menus.addSubMenuItem('topbar', 'transactions', local.menuRemittances[lang], 'transactions/list-remittances', undefined, false, 27);
		Menus.addSubMenuItem('topbar', 'transactions', local.menuBills[lang], 'transactions/list-billpayments', undefined, false, 26);
		Menus.addSubMenuItem('topbar', 'transactions', local.menuTopUps[lang], 'transactions/list-topups', undefined, false, 24);
		Menus.addSubMenuItem('topbar', 'transactions', local.menuCardTopUps[lang], 'transactions/card-topups', undefined, false, 33);
	}
]);