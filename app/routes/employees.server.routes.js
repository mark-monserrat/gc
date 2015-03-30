'use strict';

module.exports = function(app) {
	var users = require('../../app/controllers/users');
	var employees = require('../../app/controllers/employees');

	// Employees Routes
	app.route('/employees')
		.get(users.requiresLogin, employees.hasAuthorization, employees.list)
		.post(users.requiresLogin, function(req, res){
            employees.create(req, res, app);
        });

    app.route('/employees/count')
        .get(users.requiresLogin, employees.hasAuthorization, employees.countAll);

	app.route('/employees/:employeeId')
		.get(users.requiresLogin, employees.hasAuthorization, employees.read)
		.put(users.requiresLogin, employees.hasAuthorization, employees.update)
		.delete(users.requiresLogin, employees.hasAuthorization, employees.delete);

    app.route('/employees/reset_password/:employeeId')
        .post(function(req, res){
            employees.reset_password(req, res, app);
        });

	// Finish by binding the Employee middleware
	app.param('employeeId', employees.employeeByID);
};