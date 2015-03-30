'use strict';

module.exports = function(app) {
	var users = require('../../app/controllers/users');
	var beneficiaries = require('../../app/controllers/beneficiaries');

	// Beneficiaries Routes
	app.route('/beneficiaries')
		.get(users.requiresLogin, beneficiaries.list)
		.post(users.requiresLogin, beneficiaries.create);

    app.route('/beneficiaries/count')
        .get(users.requiresLogin, beneficiaries.hasAuthorization, beneficiaries.countAll);

	app.route('/beneficiaries/:beneficiaryId')
		.get(beneficiaries.read)
		.put(users.requiresLogin, beneficiaries.hasAuthorization, beneficiaries.update)
		.delete(users.requiresLogin, beneficiaries.hasAuthorization, beneficiaries.delete);

	// Finish by binding the Beneficiary middleware
	app.param('beneficiaryId', beneficiaries.beneficiaryByID);
};