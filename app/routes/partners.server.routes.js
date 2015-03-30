'use strict';

module.exports = function(app) {
	var users = require('../../app/controllers/users');
	var partners = require('../../app/controllers/partners');

	// Partners Routes
	app.route('/partners')
		.get(partners.list)
		.post(users.requiresLogin, partners.create);

    app.route('/partners/count')
        .get(users.requiresLogin, partners.hasAuthorization, partners.countAll);

	app.route('/partners/:partnerId')
		.get(partners.read)
		.put(users.requiresLogin, partners.hasAuthorization, partners.update)
		.delete(users.requiresLogin, partners.hasAuthorization, partners.delete);


    app.route('/partners/billers/:partnerId')
        .get(users.requiresLogin, partners.hasAuthorization, partners.get_billers);

    // Finish by binding the Partner middleware
	app.param('partnerId', partners.partnerByID);
};