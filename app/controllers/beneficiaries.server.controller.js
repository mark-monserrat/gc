'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    helper = require('../../app/controllers/app-helper'),
	Beneficiary = mongoose.model('Beneficiary'),
	_ = require('lodash');

/**
 * Get the error message from error object
 */
var getErrorMessage = function(err) {
    var message = {};
	if (err.code) {
		switch (err.code) {
			case 11000:
			case 11001:
				message.general = 'Beneficiary already exists';
				break;
			default:
				message.general = 'Something went wrong';
		}
	} else {
		for (var errName in err.errors) {
            if (err.errors[errName].message) message[errName] = err.errors[errName].message;
		}
	}

	return message;
};

/**
 * Create a Beneficiary
 */
exports.create = function(req, res) {
    if(typeof req.body.member === 'object'){
        req.body.member = req.body.member._id;
        req.body.member_name = req.body.member.first_name + ' ' + req.body.member.last_name;
    }
    if(typeof req.body.country === 'object'){
        req.body.country = req.body.country._id;
        req.body.country_name = req.body.country.name;
    }
	var beneficiary = new Beneficiary(req.body);

	beneficiary.save(function(err) {
		if (err) {
			return res.send(400, {
				message: getErrorMessage(err)
			});
		} else {
			res.jsonp(beneficiary);
		}
	});
};

/**
 * Show the current Beneficiary
 */
exports.read = function(req, res) {
	res.jsonp(req.beneficiary);
};

/**
 * Update a Beneficiary
 */
exports.update = function(req, res) {
	var beneficiary = req.beneficiary ;

    if(typeof req.body.member === 'object'){
        req.body.member_name = req.body.member.first_name + ' ' + req.body.member.last_name;
        req.body.member = req.body.member._id;
    }
    if(typeof req.body.country === 'object'){
        req.body.country = req.body.country._id;
        req.body.country_name = req.body.country.name;
    }

    var old_data = JSON.parse(JSON.stringify(req.beneficiary));
	beneficiary = _.extend(beneficiary , req.body);

    helper.addAuditTrails('Beneficiaries', old_data, beneficiary, req.user._id);

    var member;

    var getMember = function(next){
        var Member = mongoose.model('Member');
        console.log(beneficiary.member);
        Member.findById(beneficiary.member).select('-password -salt').exec(function(err, _member){
            if(err){
                return res.send(400,{
                    message: getErrorMessage(err)
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
    console.log(beneficiary);
	beneficiary.save(function(err) {
		if (err) {
			return res.send(400, {
				message: getErrorMessage(err)
			});
		} else {
            // TODO: SEND EMAIL NOTIFICATION
            getMember(function(){
                saveMember(function(){
                    res.jsonp(beneficiary);
                });
            });
		}
	});
};

/**
 * Delete an Beneficiary
 */
exports.delete = function(req, res) {
	var beneficiary = req.beneficiary ;

	beneficiary.remove(function(err) {
		if (err) {
			return res.send(400, {
				message: getErrorMessage(err)
			});
		} else {
			res.jsonp(beneficiary);
		}
	});
};

/**
 * List of Beneficiaries
 */
exports.list = function(req, res) {
    var where = null;
    if(req.query.member){
        where = {member:req.query.member};
    }

    if(req.query.status){
        where = {status:req.query.status};
    }

    var page = req.query.page || 1;
    var sort = req.query.sort || 'date_created';
    var by = req.query.by === 'true' ? '' : '-';
    var limit = 10;

    var skip = (page - 1) * limit;

    var beneficiaries;

    var populateMemberFields = function(next){
        var Member = mongoose.model('Member');
        var total = beneficiaries.length;
        var counter = 0;
        var populate = function(beneficiary){
            var promise = Member.populate(beneficiary.member,[
                {path:'country'},
                {path:'remittance'},
                {path:'microfinance'}
            ]);
            promise.then(function(){
                console.log(beneficiaries);
                if(counter === total-1){
                    next();
                } else {
                    counter++;
                    populate(beneficiaries[counter]);
                }
            });
        };
        if(total>0){
            populate(beneficiaries[counter]);
        } else {
            next();
        }
    };

    Beneficiary.
        find(where).
        sort(by+sort).
        skip(skip).
        limit(limit).
        populate('country').
        populate('member').
        exec(function(err, _beneficiaries) {
		if (err) {
			return res.send(400, {
				message: getErrorMessage(err)
			});
		} else {
            beneficiaries = _beneficiaries;
            populateMemberFields(function(){
                res.jsonp(beneficiaries);
            });
		}
	});
};

exports.countAll = function(req, res){
    var where = null;
    console.log(req.query);
    if(req.query.status){
        where = {status:req.query.status};
    }
    Beneficiary.count(where, function (err, count) {
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
 * WebService - AddBeneficiary
 * @param req
 * @param res
 * @param app
 * @constructor
 */
exports.AddBeneficiary = function(req, res, app){
    var beneficiary = new Beneficiary(req.body.data);

    var Member = mongoose.model('Member');

    var member;
    var country;

    var getMember = function(next){
        Member.findById(req.member._id).select('-password -salt').exec(function(err, _member){
            if(err){
                res.send(400, {
                    message : getErrorMessage(err)
                });
            } else {
                if(!_member){
                    res.send(400,{
                        message: 'Uknown member'
                    });
                } else {
                    member = _member;
                    next();
                }
            }
        });
    };

    var saveMember = function(next){
        member.beneficiaries_link.push(beneficiary._id);
        member.isUpdated = [];
        member.save(function(err){
            if(err){
                res.send(400, {
                    message: getErrorMessage(err)
                });
            } else {
                next();
            }
        });
    };

    var saveBeneficiary = function(next){
        beneficiary.member = member._id;
        beneficiary.status = 'Pending';
        beneficiary.member_name = member.first_name + ' ' + member.last_name;
        beneficiary.country_name = country.name;
        beneficiary.save(function (err) {
            if (err) {
                return res.send(400, {
                    message: getErrorMessage(err)
                });
            } else {
                next();
            }
        });
    };

    var getCountry = function(next){
        var Country = mongoose.model('Country');
        Country.findById(beneficiary.country).exec(function(err, _country){
            country = _country;
            next();
        });
    };

    getMember(function() {
        getCountry(function(){
            saveBeneficiary(function(){
                saveMember(function(){
                    res.jsonp({
                        code : 0,
                        message : 'Success',
                        beneficiary : beneficiary
                    });
                });
            });
        });
    });
};

/**
 * Beneficiary middleware
 */
exports.beneficiaryByID = function(req, res, next, id) {
    Beneficiary.findById(id).populate('country').exec(function(err, beneficiary) {
		if (err) return next(err);
		if (! beneficiary) return next(new Error('Failed to load Beneficiary ' + id));
		req.beneficiary = beneficiary;
		next();
	});
};

/**
 * Beneficiary authorization middleware
 */
exports.hasAuthorization = function(req, res, next) {
	next();
};