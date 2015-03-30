'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Partner = mongoose.model('Partner'),
    helper = require('../../app/controllers/app-helper'),
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
				message = {general:'Partner already exists'};
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
 * Create a Partner
 */
exports.create = function(req, res) {
    var billers = JSON.parse(JSON.stringify(req.body.biller_link));
    var payout_methods = JSON.parse(JSON.stringify(req.body.payout_method));
    delete req.body.biller_link;
    delete req.body.payout_method;
	var partner = new Partner(req.body);
    var save = function(){
        console.log(partner.partner_type);
        if(partner.partner_type=='Remittance and Bills Payments'){
            if(!partner.gochannel_fee){
                return res.send(400,{
                    message: {gochannel_fee: 'Codehood fee is required'}
                });
            }
            if(!partner.partner_fee){
                return res.send(400,{
                    message: {partner_fee: 'Partner fee is required'}
                });
            }
        }
        partner.save(function(err) {
            if (err) {
                return res.send(400, {
                    message: getErrorMessage(err)
                });
            } else {
                res.jsonp(partner);
            }
        });
    };
    var save_billers = function(){
        var Biller = mongoose.model('Biller');
        billers.forEach(function(biller){
            var _biller = new Biller(biller);
            _biller.partner = partner._id;
            _biller.save(function(err){
                if(err){
                    res.send(400, {
                        message: 'Error saving biller'
                    });
                } else {
                    partner.biller_link.push(_biller._id);
                    if(biller === billers[billers.length-1]){
                        if(payout_methods.length>0){
                            save_payoutmethods();
                        } else {
                            save();
                        }
                    }
                }
            });
        });
    };
    var save_payoutmethods = function(){
        var PayoutMethod = mongoose.model('PayoutMethod');
        payout_methods.forEach(function(payout_method){
            var _payout_method = new PayoutMethod(payout_method);
            _payout_method.save(function(err){
                if(err){
                    res.send(400, {
                        message: 'Error saving payout method'
                    });
                } else {
                    partner.payout_method.push(_payout_method._id);
                    if(payout_method === payout_methods[payout_methods.length-1]){
                        save();
                    }
                }
            });
        });
    };
    var populate = function(next){
        var populateCountry = function(n){
            var Country = mongoose.model('Country');
            Country.findById(partner.country).exec(function(err, country){
                if(err){
                    res.send(400,{
                        message:{general:'Error populating country'}
                    });
                } else {
                    if(country){
                        partner.country_name = country.name;
                    }
                    n();
                }
            });
        };

        populateCountry(next);
    };

    populate(function() {
        if (billers.length > 0) {
            save_billers();
        } else if (payout_methods.length > 0) {
            save_payoutmethods();
        } else {
            save();
        }
    });
};

/**
 * Show the current Partner
 */
exports.read = function(req, res) {
	res.jsonp(req.partner);
};

/**
 * Update a Partner
 */
exports.update = function(req, res) {
	var partner = req.partner;
    var billers = JSON.parse(JSON.stringify(req.body.biller_link));
    var payout_methods = JSON.parse(JSON.stringify(req.body.payout_method));


    var old_data = JSON.parse(JSON.stringify(partner));
	partner = _.extend(partner , req.body);

    helper.addAuditTrails('Partner', old_data, partner, req.user._id);

    var saveMembers = function(next){
        var updateBy = function(condition, field, n){
            var Member = mongoose.model('Member');
            Member.update(condition,{$set:field},{upsert:false,multi:true}, function(err){
                if(err){
                    res.send(400,{
                        message:{general:'Error updating related members'}
                    });
                } else {
                    n();
                }
            });
        };

        updateBy({remittance:partner._id}, {remittance_name: partner.name}, function(){
            updateBy({microfinance: partner._id}, {microfinance_name: partner.name}, next);
        });
    };

    var save = function() {
        saveMembers(function(){
            console.log(partner.partner_type);
            if(partner.partner_type=='Remittance and Bills Payments'){
                console.log('asd');
                if(!partner.gochannel_fee){
                    return res.send(400,{
                        message: {gochannel_fee: 'Codehood fee is required'}
                    });
                }
                if(!partner.partner_fee){
                    return res.send(400,{
                        message: {partner_fee: 'Partner fee is required'}
                    });
                }
            }
            partner.save(function (err) {
                if (err) {
                    return res.send(400, {
                        message: getErrorMessage(err)
                    });
                } else {
                    res.jsonp(partner);
                }
            });
        });
    };

    var save_billers = function(){
        var Biller = mongoose.model('Biller');
        billers.forEach(function(biller){
            Biller.findOne({_id:biller._id}).exec(function(err,_biller){
                var save_biller = function(isNew){
                    _biller.partner = partner._id;
                    _biller.save(function(err){
                        if(err){
                            res.send(400,{
                                message: 'Error saving biller'
                            });
                        } else {
                            if(isNew){
                                partner.biller_link.push(_biller._id);
                            }
                            if(biller === billers[billers.length-1]){
                                if(payout_methods.length>0){
                                    save_payoutmethods();
                                } else {
                                    save();
                                }
                            }
                        }
                    });
                };
                if(err){
                    res.send(400, {
                        message: 'Error populating biller'
                    });
                } else {
                    if(_biller){
                        _biller.name = biller.name;
                        var old_data = JSON.parse(JSON.stringify(_biller));
                        _biller = _.extend(_biller, biller);
                        helper.addAuditTrails('Biller', old_data, _biller, req.user._id);
                        save_biller();
                    } else {
                        _biller = new Biller(biller);
                        save_biller(true);
                    }
                }
            });
        });
    };

    var save_payoutmethods = function(){
        var PayoutMethod = mongoose.model('PayoutMethod');
        payout_methods.forEach(function(payout_method){
            PayoutMethod.findOne({_id:payout_method._id}).exec(function(err,_payout_method){
                var save_payoutmethod = function(isNew){
                    _payout_method.save(function(err){
                        if(err){
                            res.send(400,{
                                message: 'Error saving payout method'
                            });
                        } else {
                            if(isNew){
                                partner.payout_method.push(_payout_method._id);
                            }
                            if(payout_method === payout_methods[payout_methods.length-1]){
                                save();
                            }
                        }
                    });
                };
                if(err){
                    res.send(400, {
                        message: 'Error populating payout method'
                    });
                } else {
                    if (_payout_method) {
                        var old_data = JSON.parse(JSON.stringify(_payout_method));
                        _payout_method = _.extend(_payout_method, payout_method);
                        helper.addAuditTrails('PayoutMethod', old_data, _payout_method, req.user._id);
                        save_payoutmethod();
                    } else {
                        _payout_method = new PayoutMethod(payout_method);
                        save_payoutmethod(true);
                    }
                }
            });
        });
    };

    var populate = function(next){
        var populateCountry = function(n){
            var Country = mongoose.model('Country');
            Country.findById(partner.country).exec(function(err, country){
                if(err){
                    res.send(400,{
                        message:{general:'Error populating country'}
                    });
                } else {
                    partner.country_name = country.name;
                    n();
                }
            });
        };

        populateCountry(next);
    };

    populate(function() {
        if (billers.length > 0) {
            save_billers();
        } else if (payout_methods.length > 0) {
            save_payoutmethods();
        } else {
            save();
        }
    });
};

/**
 * Delete an Partner
 */
exports.delete = function(req, res) {
	var partner = req.partner ;

	partner.remove(function(err) {
		if (err) {
			return res.send(400, {
				message: getErrorMessage(err)
			});
		} else {
			res.jsonp(partner);
		}
	});
};

/**
 * List of Partners
 */
exports.list = function(req, res) {
    var where = null;
    if(req.query.partner_type){
        where = req.query;
    }
    var page = req.query.page || 1;
    var sort = req.query.sort || 'date_created';
    var by = req.query.by === 'true' ? '' : '-';
    var limit = 10;

    var skip = (page - 1) * limit;
    Partner.find(where)
        .sort(by+sort)
        .skip(skip).limit(limit)
        .populate('country')
        .populate('biller_link')
        .exec(function(err, partners) {
            if (err) {
                return res.send(400, {
                    message: getErrorMessage(err)
                });
            } else {
                res.jsonp(partners);
            }
	    });
};

exports.countAll = function(req, res){
    Partner.count({}, function (err, count) {
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
 * Get Partner Billers
 * @param req
 * @param res
 * @param next
 */
exports.get_billers = function(req, res, next){
    Partner.populate(req.partner, 'biller_link').exec(function(err, partner){
        res.jsonp(partner);
    });
};

/**
 * Partner middleware
 */
exports.partnerByID = function(req, res, next, id) {
    Partner
        .findById(id)
        .populate('biller_link')
        .populate('payout_method')
        .exec(function(err, partner) {
            if (err) return next(err);
            if (! partner) return next(new Error('Failed to load Partner ' + id));
            req.partner = partner ;
            next();
        });
};

/**
 * Partner authorization middleware
 */
exports.hasAuthorization = function(req, res, next) {
//	if (req.partner.user.id !== req.user.id) {
//		return res.send(403, 'User is not authorized');
//	}
	next();
};