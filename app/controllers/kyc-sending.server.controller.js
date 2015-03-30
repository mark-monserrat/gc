'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    _ = require('lodash'),
    KycSending = mongoose.model('KycSending'),
    helper = require('../../app/controllers/app-helper');

/**
 * Create a Kyc sending
 */
exports.create = function(req, res) {

};

/**
 * Show the current Kyc sending
 */
exports.read = function(req, res) {

};

/**
 * Update a Kyc sending
 */
exports.update = function(req, res) {

};

/**
 * Delete an Kyc sending
 */
exports.delete = function(req, res) {

};

/**
 * List of Kyc sendings
 */
exports.list = function(req, res) {
    var page = req.query.page || 1;
    var sort = req.query.sort || 'date_created';
    var by = req.query.by === 'true' ? '' : '-';
    var limit = 10;

    var skip = (page - 1) * limit;


    KycSending.find().sort(by+sort).skip(skip).limit(limit).populate('members').exec(function(err, kycsending) {
        if (err) {
            return res.send(400, {
                message: helper.getErrorMessage(err)
            });
        } else {
            res.jsonp(kycsending);
        }
    });
};

exports.countAll = function(req, res){
    KycSending.count({}, function (err, count) {
        if (err){
            return res.send(400, {
                message: helper.getErrorMessage(err)
            });
        } else {
            res.jsonp({total: count});
        }
    });
};


/**
 * Member authorization middleware
 */
exports.hasAuthorization = function(req, res, next) {
//	if (req.member.user.id !== req.user.id) {
//		return res.send(403, 'User is not authorized');
//	}
    next();
};

exports.requiresLogin = function(req, res, next, id) {
//    Member.findOne({_id:req.body.user._id}).exec(function(err,member){
//        if(err || !member){
//            res.send(400,{
//                message:'Request not authenticated'
//            });
//        } else {
    next();
//        }
//    });
};

/**
 * Member middleware
 */
exports.kycsendingByID = function(req, res, next, id) {
    KycSending.findById(id).exec(function(err, kycsending) {
        if (err) return next(err);
        if (! kycsending) return next(new Error('Failed to load Kyc Sending ' + id));
        req.kycsending = kycsending;
        next();
    });
};
