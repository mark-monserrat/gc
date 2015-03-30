'use strict';

var passport = require('passport'),
    Employee = require('mongoose').model('Employee'),
	path = require('path'),
	config = require('./config');

module.exports = function() {
	// Serialize sessions
	passport.serializeUser(function(employee, done) {
		done(null, employee.id);
	});

	// Deserialize sessions
	passport.deserializeUser(function(id, done) {
        Employee.findOne({
			_id: id
		}, '-salt -password').populate('role').exec(function(err, employee) {
            done(err, employee);
        });
	});

	// Initialize strategies
	config.getGlobbedFiles('./config/strategies/**/*.js').forEach(function(strategy) {
		require(path.resolve(strategy))();
	});
};