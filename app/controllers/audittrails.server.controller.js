'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    _ = require('lodash'),
    helper = require('../../app/controllers/app-helper'),
    AuditTrails = mongoose.model('AuditTrails');

/**
 * Create a Audittrail
 */
exports.create = function(req, res) {

};

/**
 * Show the current Audittrail
 */
exports.read = function(req, res) {

};

/**
 * Update a Audittrail
 */
exports.update = function(req, res) {

};

/**
 * Delete an Audittrail
 */
exports.delete = function(req, res) {

};

/**
 * List of Audittrails
 */
exports.list = function(req, res) {
    var page = req.query.page || 1;
    var sort = req.query.sort || 'date_created';
    var by = req.query.by === 'true' ? '' : '-';
    var limit = 10;

    var skip = (page - 1) * limit;
    AuditTrails.
        find().
        sort(by+sort).
        skip(skip).
        limit(limit).
        populate('user').
        exec(function(err, audittrails) {
            if (err) {
                return res.send(400, {
                    message: helper.getErrorMessage(err)
                });
            } else {
                res.jsonp(audittrails);
            }
        });
};


exports.countAll = function(req, res){
    AuditTrails.count({}, function (err, count) {
        if (err){
            return res.send(400, {
                message: helper.getErrorMessage(err)
            });
        } else {
            res.jsonp({total: count});
        }
    });
};