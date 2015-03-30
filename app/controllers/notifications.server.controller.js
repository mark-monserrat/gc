'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Notification = mongoose.model('Notification'),
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
				message = 'Notification already exists';
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
 * Create a Notification
 */
exports.create = function(req, res) {
	var notification = new Notification(req.body);
	notification.user = req.user;

	notification.save(function(err) {
		if (err) {
			return res.send(400, {
				message: getErrorMessage(err)
			});
		} else {
			res.jsonp(notification);
		}
	});
};

/**
 * Show the current Notification
 */
exports.read = function(req, res) {
	res.jsonp(req.notification);
};

/**
 * Update a Notification
 */
exports.update = function(req, res) {
	var notification = req.notification ;

	notification = _.extend(notification , req.body);

	notification.save(function(err) {
		if (err) {
			return res.send(400, {
				message: getErrorMessage(err)
			});
		} else {
			res.jsonp(notification);
		}
	});
};

/**
 * Delete an Notification
 */
exports.delete = function(req, res) {
	var notification = req.notification ;

	notification.remove(function(err) {
		if (err) {
			return res.send(400, {
				message: getErrorMessage(err)
			});
		} else {
			res.jsonp(notification);
		}
	});
};

/**
 * List of Notifications
 */
exports.list = function(req, res) { Notification.find().sort('-created').populate('user', 'displayName').exec(function(err, notifications) {
		if (err) {
			return res.send(400, {
				message: getErrorMessage(err)
			});
		} else {
			res.jsonp(notifications);
		}
	});
};

/**
 * Notification middleware
 */
exports.notificationByID = function(req, res, next, id) { Notification.findById(id).populate('user', 'displayName').exec(function(err, notification) {
		if (err) return next(err);
		if (! notification) return next(new Error('Failed to load Notification ' + id));
		req.notification = notification ;
		next();
	});
};

/**
 * Notification authorization middleware
 */
exports.hasAuthorization = function(req, res, next) {
	if (req.notification.user.id !== req.user.id) {
		return res.send(403, 'User is not authorized');
	}
	next();
};