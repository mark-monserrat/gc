'use strict';

module.exports = function(app) {
	var users = require('../../app/controllers/users');
	var members = require('../../app/controllers/members');

	// Members Routes
	app.route('/members')
		.get(users.requiresLogin, members.hasAuthorization, members.list)
		.post(users.requiresLogin, members.hasAuthorization, function(req, res){
            members.create(req, res, app);
        });

    app.route('/members/count')
        .get(users.requiresLogin, members.hasAuthorization, members.countAll);

    app.route('/members/sendbatch')
        .post(users.requiresLogin, members.hasAuthorization, function(req,res){
            members.sendKYC(req, res, app);
        });

    app.route('/members/resendbatch')
        .post(users.requiresLogin, members.hasAuthorization, function(req,res){
            members.resendKYC(req, res, app);
        });

    app.route('/members/onhold')
        .post(users.requiresLogin, members.hasAuthorization, members.holdKYC);

	app.route('/members/:memberId')
		.get(users.requiresLogin, members.hasAuthorization, members.read)
		.put(users.requiresLogin, members.hasAuthorization, members.update)
		.delete(users.requiresLogin, members.hasAuthorization, members.delete);

    app.route('/members/reset_password/:memberId')
        .post(users.requiresLogin, function(req, res){
            members.reset_password(req, res, app);
        });

	// Finish by binding the Member middleware
	app.param('memberId', members.memberByID);
};