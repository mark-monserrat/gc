'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Service = mongoose.model('Service'),
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
				message = 'Service already exists';
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
 * Create a Service
 */
exports.create = function(req, res) {
	var service = new Service(req.body);
	service.user = req.user;

	service.save(function(err) {
		if (err) {
			return res.send(400, {
				message: getErrorMessage(err)
			});
		} else {
			res.jsonp(service);
		}
	});
};

/**
 * Show the current Service
 */
exports.read = function(req, res) {
	res.jsonp(req.service);
};

/**
 * Update a Service
 */
exports.update = function(req, res) {
	var service = req.service ;

	service = _.extend(service , req.body);

	service.save(function(err) {
		if (err) {
			return res.send(400, {
				message: getErrorMessage(err)
			});
		} else {
			res.jsonp(service);
		}
	});
};

/**
 * Delete an Service
 */
exports.delete = function(req, res) {
	var service = req.service ;

	service.remove(function(err) {
		if (err) {
			return res.send(400, {
				message: getErrorMessage(err)
			});
		} else {
			res.jsonp(service);
		}
	});
};

/**
 * List of Services
 */
exports.list = function(req, res) { Service.find().sort('-created').populate('user', 'displayName').exec(function(err, services) {
		if (err) {
			return res.send(400, {
				message: getErrorMessage(err)
			});
		} else {
			res.jsonp(services);
		}
	});
};

/**
 * Service middleware
 */
exports.serviceByID = function(req, res, next, id) { Service.findById(id).populate('user', 'displayName').exec(function(err, service) {
		if (err) return next(err);
		if (! service) return next(new Error('Failed to load Service ' + id));
		req.service = service ;
		next();
	});
};

/**
 * Service authorization middleware
 */
exports.hasAuthorization = function(req, res, next) {
	if (req.service.user.id !== req.user.id) {
		return res.send(403, 'User is not authorized');
	}
	next();
};