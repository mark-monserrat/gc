'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	passport = require('passport'),
    helper = require('../../app/controllers/app-helper'),
	Employee = mongoose.model('Employee'),
	_ = require('lodash');

/**
 * Get the error message from error object
 */
var getErrorMessage = function(err) {
	var message = '';

	if (err.code) {
		switch (err.code) {
			case 11000:
			case 11001:
				message = 'Username already exists';
				break;
			default:
				message = 'Something went wrong';
		}
	} else {
		for (var errName in err.errors) {
			if (err.errors[errName].message) message = err.errors[errName].message;
		}
	}

	return message;
};

/**
 * Signin after passport authentication
 */
exports.signin = function(req, res, next) {
	passport.authenticate('local', function(err, employee, info) {
		if (err || !employee) {
			res.send(400, info);
		} else {
//            employee.populate('privileges.privilege',function(employee){
                // Remove sensitive data before login
                employee.password = undefined;
                employee.salt = undefined;

                req.login(employee, function(err) {
                    if (err) {
                        res.send(400, err);
                    } else {
                        res.jsonp(employee);
                    }
                });
//            });
		}
	})(req, res, next);
};

/**
 * Update employee details
 */
exports.update = function(req, res) {
	// Init Variables
	var employee = req.employee;
	var message = null;

	// For security measurement we remove the roles from the req.body object
	delete req.body.roles;

	if (employee) {
		// Merge existing employee
		employee = _.extend(employee, req.body);
		employee.updated = Date.now();
		employee.displayName = employee.firstName + ' ' + employee.lastName;

		employee.save(function(err) {
			if (err) {
				return res.send(400, {
					message: getErrorMessage(err)
				});
			} else {
				req.login(employee, function(err) {
					if (err) {
						res.send(400, err);
					} else {
						res.jsonp(employee);
					}
				});
			}
		});
	} else {
		res.send(400, {
			message: 'Employee is not signed in'
		});
	}
};

/**
 * Change Password
 */
exports.changePassword = function(req, res, app) {
	// Init Variables
	var passwordDetails = req.body;
	var message = null;

	if (req.employee) {
		Employee.findById(req.employee.id, function(err, employee) {
			if (!err && employee) {
				if (employee.authenticate(passwordDetails.currentPassword)) {
					if (passwordDetails.newPassword === passwordDetails.verifyPassword) {
						employee.password = passwordDetails.newPassword;

						employee.save(function(err) {
							if (err) {
								return res.send(400, {
									message: getErrorMessage(err)
								});
							} else {
								req.login(employee, function(err) {
									if (err) {
										res.send(400, err);
									} else {
                                        res.render('email', {
                                            password: passwordDetails.newPassword,
                                            firstname: employee.first_name,
                                            lastname: employee.last_name
                                        }, function(err, html){
                                            helper.sendMail(
                                                [employee.email,'jasonvillalon@gmail.com'],
                                                'Your Account Information',
                                                html,
                                                null,
                                                function (status) {
                                                    if(status==='Failed'){
                                                        return res.jsonp(employee);
                                                    }
                                                }
                                            );
                                        });
										res.send({
											message: 'Password changed successfully'
										});
									}
								});
							}
						});
					} else {
						res.send(400, {
							message: 'Passwords do not match'
						});
					}
				} else {
					res.send(400, {
						message: 'Current password is incorrect'
					});
				}
			} else {
				res.send(400, {
					message: 'Employee is not found'
				});
			}
		});
	} else {
		res.send(400, {
			message: 'Employee is not signed in'
		});
	}
};

/**
 * Signout
 */
exports.signout = function(req, res) {
	req.logout();
	res.redirect('/');
};

/**
 * Send Employee
 */
exports.me = function(req, res) {
	res.jsonp(req.employee || null);
};

/**
 * Employee middleware
 */
exports.userByID = function(req, res, next, id) {
	Employee.findOne({
		_id: id
	}).exec(function(err, employee) {
		if (err) return next(err);
		if (!employee) return next(new Error('Failed to load Employee ' + id));
		req.employee = employee;
		next();
	});
};

/**
 * Require login routing middleware
 */
exports.requiresLogin = function(req, res, next) {
	if (!req.isAuthenticated()) {
		return res.send(401, {
			message: 'Employee is not logged in'
		});
	}

	next();
};

/**
 * Employee authorizations routing middleware
 */
exports.hasAuthorization = function(roles) {
	var _this = this;
	return function(req, res, next) {
		_this.requiresLogin(req, res, function() {
			if (_.intersection(req.user.role, roles).length) {
				return next();
			} else {
				return res.send(403, {
					message: 'Employee is not authorized'
				});
			}
		});
	};
};
