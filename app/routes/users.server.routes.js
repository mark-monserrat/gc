'use strict';

/**
 * Module dependencies.
 */
var passport = require('passport');

module.exports = function(app) {
	// User Routes
	var users = require('../../app/controllers/users');
	app.route('/users/me').get(users.me);

	app.route('/users/password/:userId').put(users.requiresLogin, function(req, res){
        users.changePassword(req, res, app);
    });

	// Setting up the users api
	app.route('/auth/signin').post(users.signin);
	app.route('/auth/signout').get(users.signout);

	// Finish by binding the user middleware
	app.param('userId', users.userByID);
};