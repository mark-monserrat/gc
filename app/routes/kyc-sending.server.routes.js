'use strict';

module.exports = function(app) {
    var users = require('../../app/controllers/users');
    var kycSending = require('../../app/controllers/kyc-sending');

    // KYC Sending Routes
    app.route('/kyc-sending')
        .get(users.requiresLogin, kycSending.hasAuthorization, kycSending.list);

    app.route('/kyc-sending/count')
        .get(users.requiresLogin, kycSending.hasAuthorization, kycSending.countAll);

    // Finish by binding the Member middleware
    app.param('kycsendingId', kycSending.kycsendingByID);
};