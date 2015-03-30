'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Country = mongoose.model('Country'),
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
				message = 'Country already exists';
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
 * Create a Country
 */
exports.create = function(req, res) {
	var country = new Country(req.body);
	country.user = req.user;

	country.save(function(err) {
		if (err) {
			return res.send(400, {
				message: getErrorMessage(err)
			});
		} else {
			res.jsonp(country);
		}
	});
};

/**
 * Show the current Country
 */
exports.read = function(req, res) {
	res.jsonp(req.country);
};

/**
 * Update a Country
 */
exports.update = function(req, res) {
	var country = req.country ;

	country = _.extend(country , req.body);

	country.save(function(err) {
		if (err) {
			return res.send(400, {
				message: getErrorMessage(err)
			});
		} else {
			res.jsonp(country);
		}
	});
};

/**
 * Delete an Country
 */
exports.delete = function(req, res) {
	var country = req.country ;

	country.remove(function(err) {
		if (err) {
			return res.send(400, {
				message: getErrorMessage(err)
			});
		} else {
			res.jsonp(country);
		}
	});
};

/**
 * List of Countries
 */
exports.list = function(req, res) { Country.find().sort('-created').populate('user', 'displayName').exec(function(err, countries) {
		if (err) {
			return res.send(400, {
				message: getErrorMessage(err)
			});
		} else {
			res.jsonp(countries);
		}
	});
};

/**
 * Country middleware
 */
exports.countryByID = function(req, res, next, id) { Country.findById(id).populate('user', 'displayName').exec(function(err, country) {
		if (err) return next(err);
		if (! country) return next(new Error('Failed to load Country ' + id));
		req.country = country ;
		next();
	});
};

/**
 * Country authorization middleware
 */
exports.hasAuthorization = function(req, res, next) {
	if (req.country.user.id !== req.user.id) {
		return res.send(403, 'User is not authorized');
	}
	next();
};