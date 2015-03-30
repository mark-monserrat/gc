'use strict';

module.exports = function(app) {
    var users = require('../../app/controllers/users');
    var audittrails = require('../../app/controllers/audittrails');

    // Audit Trails Routes
    app.route('/audittrails')
        .get(users.requiresLogin, audittrails.list);
    app.route('/audittrails/count')
        .get(users.requiresLogin, audittrails.countAll);
};