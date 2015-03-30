'use strict';

module.exports = function(app) {
	var users = require('../../app/controllers/users');
	var billers = require('../../app/controllers/billers');

	// Billers Routes
	app.route('/billers')
		.get(billers.list)
		.post(users.requiresLogin, billers.create);

	app.route('/billers/:billerId')
		.get(billers.read)
		.put(users.requiresLogin, billers.hasAuthorization, billers.update)
		.delete(users.requiresLogin, billers.hasAuthorization, billers.delete);

	// Finish by binding the Biller middleware
	app.param('billerId', billers.billerByID);
};