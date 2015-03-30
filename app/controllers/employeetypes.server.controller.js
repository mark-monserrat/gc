'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Employeetype = mongoose.model('Employeetype'),
    helper = require('../../app/controllers/app-helper'),
	_ = require('lodash');

/**
 * Create a Employeetype
 */
exports.create = function(req, res) {
	var employeetype = new Employeetype(req.body);

	employeetype.user = req.user;

	employeetype.save(function(err) {
		if (err) {
			return res.send(400, {
				message: helper.getErrorMessage(err)
			});
		} else {
			res.jsonp(employeetype);
		}
	});
};

/**
 * Show the current Employeetype
 */
exports.read = function(req, res) {
	res.jsonp(req.employeetype);
};

/**
 * Update a Employeetype
 */
exports.update = function(req, res) {
	var employeetype = req.employeetype ;

    var old_data = JSON.parse(JSON.stringify(req.employeetype));
	employeetype = _.extend(employeetype , req.body);

    helper.addAuditTrails('Employee Types', old_data, employeetype, req.user._id);

	employeetype.save(function(err) {
		if (err) {
			return res.send(400, {
				message: helper.getErrorMessage(err)
			});
		} else {
            var Employee = mongoose.model('Employee');
            Employee.find({employee_type:employeetype._id}).select('_id').exec(function(err, employees){
                if(err){
                    return res.send(400, {
                        message:helper.getErrorMessage(err)
                    });
                } else {
                    if(employees.length>0){
                        employees.forEach(function(employee){
                            Employee.findById(employee._id).select('_id role').exec(function(err,employee){
                                if(err){
                                    console.log(err);
                                } else {
                                    employee.role = employeetype.privileges;
                                    employee.save(function(err){
                                        if(err){
                                            console.log(err);
                                        } else {
                                            console.log(employees[employees.length-1]._id);
                                            console.log(employee._id);
                                            console.log('------------');
                                            if(_.isEqual(employee._id,employees[employees.length-1]._id)){
                                                console.log('eq');
                                                res.jsonp(employeetype);
                                            }
                                        }
                                    });
                                }
                            });
                        });
                    } else {
                        res.jsonp(employeetype);
                    }
                }
            });
		}
	});
};

/**
 * Delete an Employeetype
 */
exports.delete = function(req, res) {
	var employeetype = req.employeetype ;

	employeetype.remove(function(err) {
		if (err) {
			return res.send(400, {
				message: helper.getErrorMessage(err)
			});
		} else {
			res.jsonp(employeetype);
		}
	});
};

/**
 * List of Employeetypes
 */
exports.list = function(req, res) {
    var page = req.query.page || 1;
    var sort = req.query.sort || 'date_created';
    var by = req.query.by === 'true' ? '' : '-';
    var limit = 10;

    var skip = (page - 1) * limit;
    Employeetype.
        find().
        sort(by+sort).
        skip(skip).
        limit(limit).
        sort('-created').
        exec(function(err, employeetypes) {
		if (err) {
			return res.send(400, {
				message: helper.getErrorMessage(err)
			});
		} else {
			res.jsonp(employeetypes);
		}
	});
};

exports.countAll = function(req, res){
    Employeetype.count({}, function (err, count) {
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
 * Employeetype middleware
 */
exports.employeetypeByID = function(req, res, next, id) { Employeetype.findById(id).populate('user', 'displayName').exec(function(err, employeetype) {
		if (err) return next(err);
		if (! employeetype) return next(new Error('Failed to load Employeetype ' + id));
		req.employeetype = employeetype ;
		next();
	});
};

/**
 * Employeetype authorization middleware
 */
exports.hasAuthorization = function(req, res, next) {
//	if (req.employeetype.user.id !== req.user.id) {
//		return res.send(403, 'User is not authorized');
//	}
	next();
};