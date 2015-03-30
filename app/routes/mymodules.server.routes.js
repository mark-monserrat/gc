'use strict';

module.exports = function(app) {
	var users = require('../../app/controllers/users');
    var mymodules = require('../../app/controllers/mymodules');

    app.route('/modules')
        .get(users.requiresLogin, mymodules.list);

    app.route('/modules/:moduleId')
        .get(mymodules.read);


    // Finish by binding the Member middleware
    app.param('moduleId', mymodules.moduleByID);
};