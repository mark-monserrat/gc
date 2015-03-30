'use strict';

module.exports = function(app) {
	var users = require('../../app/controllers/users');
	var transactions = require('../../app/controllers/transactions');

	// Transactions Routes
	app.route('/transactions')
		.get(users.requiresLogin, transactions.list);

    app.route('/transactions/count')
        .get(users.requiresLogin, transactions.hasAuthorization, transactions.countAll);

    app.route('/transactions/cardtopup')
        .post(users.requiresLogin, function(req, res){
            transactions.addCardTopup(req, res, app);
        });

    app.route('/transactions/:transactionId')
//        .get(users.requiresLogin, transactions.read)
        .put(users.requiresLogin, function(req, res){
            transactions.update(req, res, app);
        });

    app.route('/transaction/load/omnipay')
        .get(users.requiresLogin, transactions.loadOmniPay);

	// Finish by binding the Transaction middleware
	app.param('transactionId', transactions.transactionByID);
};