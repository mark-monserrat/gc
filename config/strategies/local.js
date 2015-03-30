'use strict';

/**
 * Module dependencies.
 */
var passport = require('passport'),
	LocalStrategy = require('passport-local').Strategy,
    Employee = require('mongoose').model('Employee');

module.exports = function() {
	// Use local strategy
	passport.use(new LocalStrategy({
			usernameField: 'username',
			passwordField: 'password'
		},
		function(username, password, done) {
            Employee.findOne({
				email: username
			}).populate('role').exec(function(err, employee) {
				if (err) {
					return done(err);
				}
				if (!employee) {
					return done(null, false, {
						message: 'Unknown employee'
					});
				}
				if (!employee.authenticate(password)) {
					return done(null, false, {
						message: 'Invalid password'
					});
				}

				return done(null, employee);
			});
		}
	));
};