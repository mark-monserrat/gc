'use strict';

module.exports = function(app) {
    var users = require('../../app/controllers/users');
    var memberbiller = require('../../app/controllers/membersbiller');

    // Beneficiaries Routes
    app.route('/memberbiller')
        .get(users.requiresLogin, memberbiller.hasAuthorization, memberbiller.list);
    app.route('/memberbiller/count')
        .get(users.requiresLogin, memberbiller.hasAuthorization, memberbiller.countAll);
    app.route('/memberbiller/:memberbillerId')
        .get(users.requiresLogin, memberbiller.hasAuthorization, memberbiller.read)
        .put(users.requiresLogin, memberbiller.hasAuthorization, memberbiller.update)
        .delete(users.requiresLogin, memberbiller.hasAuthorization, memberbiller.delete);

    // Finish by binding the Beneficiary middleware
    app.param('memberbillerId', memberbiller.memberbillerByID);
};