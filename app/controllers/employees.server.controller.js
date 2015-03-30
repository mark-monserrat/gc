'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Employee = mongoose.model('Employee'),
	_ = require('lodash'),
    crypto = require('crypto'),
    helper = require('../../app/controllers/app-helper');

/**
 * Get the error message from error object
 */
var getErrorMessage = function(err) {
	var message = {};

	if (err.code) {
		switch (err.code) {
			case 11000:
			case 11001:
				message = {general:'Employee already exists'};
				break;
			default:
				message = {general:'Something went wrong'};
		}
	} else {
		for (var errName in err.errors) {
			if (err.errors[errName].message) message[errName] = err.errors[errName].message;
		}
	}

	return message;
};

/**
 * Create a Employee
 */
exports.create = function(req, res, app) {
	var employee = new Employee(req.body);
    var password;

    var saveEmployee = function(next){
        password = exports.generate_password();
        employee.password = password;
        employee.save(function(err) {
            if (err) {
                return res.send(400, {
                    message: getErrorMessage(err)
                });
            } else {
                next();
            }
        });
    };

    var sendEmailNotification = function(next){
        helper.sendMail(
            employee.email,
            'Your Account Information',
                'Hi '+employee.first_name+' '+employee.last_name+','+
                '<br />'+
                '<br />'+
                'Here is your password: '+password+
                '<br/>'+
                '<br/>'+
                '<a href="'+req.protocol + '://' + req.headers.host + '#!/signin'+'">Click here to login</a>',
            null,
            function (status) {
//				if(status==='Failed'){
//					res.send(400, {message:helper.TransactionResponse.TransactionEmailSendingFailed});
//                	return;
//				}
            }
        );
        next();
    };
    saveEmployee(function(){
        sendEmailNotification(function(){
            res.jsonp(employee);
        });
    });
};

/**
 * Show the current Employee
 */
exports.read = function(req, res) {
	res.jsonp(req.employee);
};

/**
 * Update a Employee
 */
exports.update = function(req, res) {
	var employee = req.employee ;

    if(req.body.employee_type===''){
        req.body.employee_type = null;
    }

    var old_data = JSON.parse(JSON.stringify(req.employee));
	employee = _.extend(employee , req.body);

    if(_.indexOf(employee.modifiedPaths(),'last_action')===-1){
        helper.addAuditTrails('Employee', old_data, employee, req.user._id);
    }

    var saveEmployee = function(){
        employee.save(function(err) {
            if (err) {
                return res.send(400, {
                    message: getErrorMessage(err)
                });
            } else {
                res.jsonp(employee);
            }
        });
    };

    saveEmployee();
};

/**
 * Delete an Employee
 */
exports.delete = function(req, res) {
	var employee = req.employee ;

	employee.remove(function(err) {
		if (err) {
			return res.send(400, {
				message: getErrorMessage(err)
			});
		} else {
			res.jsonp(employee);
		}
	});
};

/**
 * List of Employees
 */
exports.list = function(req, res) {
    var page = req.query.page || 1;
    var sort = req.query.sort || 'date_created';
    var by = req.query.by === 'true' ? '' : '-';
    var limit = 10;

    var skip = (page - 1) * limit;
    Employee.find().
        sort(by+sort).
        skip(skip).
        limit(limit).
        select('-password -salt').
        populate('country').
        populate('role').
        populate('employee_type').
        exec(function(err, employees) {
            if (err) {
                return res.send(400, {
                    message: getErrorMessage(err)
                });
            } else {
                res.jsonp(employees);
            }
        });
};

exports.countAll = function(req, res){
    Employee.count({}, function (err, count) {
        if (err){
            return res.send(400, {
                message: getErrorMessage(err)
            });
        } else {
            res.jsonp({total: count});
        }
    });
};

/**
 * Change Password
 * @param req
 * @param res
 */

exports.generate_password = function(){
    var length = 8,
        charset = 'abcdefghijklnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=',
        retVal = '';
    for (var i = 0, n = charset.length; i < length; ++i) {
        retVal += charset.charAt(Math.floor(Math.random() * n));
    }
    return  retVal;
};

exports.reset_password = function(req, res, app){
    var employee = req.employee ;

    employee = _.extend(employee , req.body);

    var password = exports.generate_password();

    employee.password = password;

    employee.save(function(err) {
        if (err) {
            return res.send(400, {
                message: getErrorMessage(err)
            });
        } else {
            helper.sendMail(
                employee.email,
                'Your Account Information',
                    'Hi '+employee.first_name+' '+employee.last_name+','+
                    '<br />'+
                    '<br />'+
                    'Here is your password: '+password+
                    '<br/>'+
                    '<br/>'+
                    '<a href="'+req.protocol + '://' + req.headers.host + '#!/signin'+'">Click here to login</a>',
                    null,
                function (status) {
//					if(status==='Failed'){
//						res.send(400, {message:helper.TransactionResponse.TransactionEmailSendingFailed});
//                    	return;
//					}
                }
            );
            res.jsonp(employee);
        }
    });
};

/**
 * Employee middleware
 */
exports.employeeByID = function(req, res, next, id) {
    Employee.findById(id).select('-password -salt').exec(function(err, employee) {
		if (err) return next(err);
		if (! employee) return next(new Error('Failed to load Employee ' + id));
		req.employee = employee ;
		next();
	});
};

/**
 * Employee authorization middleware
 */
exports.hasAuthorization = function(req, res, next) {
    req.user.role.forEach(function(role){
    });
	next();
};