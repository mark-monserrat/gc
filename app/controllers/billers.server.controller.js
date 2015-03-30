'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Biller = mongoose.model('Biller'),
    helper = require('../../app/controllers/app-helper'),
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
				message = 'Biller already exists';
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
 * Create a Biller
 */
exports.create = function(req, res) {
	var biller = new Biller(req.body);
	biller.user = req.user;

	biller.save(function(err) {
		if (err) {
			return res.send(400, {
				message: getErrorMessage(err)
			});
		} else {
			res.jsonp(biller);
		}
	});
};

/**
 * Show the current Biller
 */
exports.read = function(req, res) {
	res.jsonp(req.biller);
};

/**
 * Update a Biller
 */
exports.update = function(req, res) {
	var biller = req.biller ;


    var old_data = JSON.parse(JSON.stringify(req.biller));
    biller = _.extend(biller , req.body);

    helper.addAuditTrails('Biller', old_data, biller, req.user._id);

    var member;

    var getMember = function(next){
        var Member = mongoose.model('Member');
        Member.findById(biller.member).select('-password -salt').exec(function(err, _member){
            if(err){
                return res.send(400,{
                    message:getErrorMessage(err)
                });
            } else {
                member = _member;
                next();
            }
        });
    };

    function saveMember(next){
        member.isUpdated = [];
        member.save(function(err){
            if(err){
                return res.send(400,{
                    message:getErrorMessage(err)
                });
            } else {
                next();
            }
        });
    }
	biller.save(function(err) {
		if (err) {
			return res.send(400, {
				message: getErrorMessage(err)
			});
		} else {
            getMember(function(){
                saveMember(function(){
                    res.jsonp(biller);
                });
            });
		}
	});
};

/**
 * Delete an Biller
 */
exports.delete = function(req, res) {
	var biller = req.biller ;

	biller.remove(function(err) {
		if (err) {
			return res.send(400, {
				message: getErrorMessage(err)
			});
		} else {
			res.jsonp(biller);
		}
	});
};

/**
 * List of Billers
 */
exports.list = function(req, res) {
    Biller.find().populate('user', 'displayName').exec(function(err, billers) {
		if (err) {
			return res.send(400, {
				message: getErrorMessage(err)
			});
		} else {
			res.jsonp(billers);
		}
	});
};

/**
 * Biller middleware
 */
exports.billerByID = function(req, res, next, id) { Biller.findById(id).populate('user', 'displayName').exec(function(err, biller) {
		if (err) return next(err);
		if (! biller) return next(new Error('Failed to load Biller ' + id));
		req.biller = biller ;
		next();
	});
};

/**
 * Biller authorization middleware
 */
exports.hasAuthorization = function(req, res, next) {
	if (req.biller.user.id !== req.user.id) {
		return res.send(403, 'User is not authorized');
	}
	next();
};