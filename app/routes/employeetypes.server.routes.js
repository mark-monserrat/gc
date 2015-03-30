'use strict';

module.exports = function(app) {
	var users = require('../../app/controllers/users');
	var employeetypes = require('../../app/controllers/employeetypes');

	// Employeetypes Routes
	app.route('/employeetypes')
		.get(employeetypes.list)
		.post(users.requiresLogin, employeetypes.create);

    app.route('/employeetypes/count')
        .get(users.requiresLogin, employeetypes.hasAuthorization, employeetypes.countAll);

	app.route('/employeetypes/:employeetypeId')
		.get(employeetypes.read)
		.put(users.requiresLogin, employeetypes.hasAuthorization, employeetypes.update)
		.delete(users.requiresLogin, employeetypes.hasAuthorization, employeetypes.delete);

	// Finish by binding the Employeetype middleware
	app.param('employeetypeId', employeetypes.employeetypeByID);
};