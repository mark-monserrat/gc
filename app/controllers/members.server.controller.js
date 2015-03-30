'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    passport = require('passport'),
	Member = mongoose.model('Member'),
	_ = require('lodash'),
    DelayedResponse = require('http-delayed-response'),
	helper = require('../../app/controllers/app-helper'),
    crypto = require('crypto');

/**
 * Get the error message from error object
 */
var getErrorMessage = function(err) {
	var message = {};

	if (err.code) {
		switch (err.code) {
			case 11000:
			case 11001:
				message.general = 'Member already exists';
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
 * Create a Member
 */
exports.create = function(req, res) {
    var ben = JSON.parse(JSON.stringify(req.body.beneficiaries_link));
    var bil = JSON.parse(JSON.stringify(req.body.biller_link));
    var loa = JSON.parse(JSON.stringify(req.body.loans_link));
    delete req.body.beneficiaries_link;
    delete req.body.biller_link;
    delete req.body.loans_link;
    var member = new Member(req.body);
    var Beneficiary = mongoose.model('Beneficiary');
    var Memberbiller = mongoose.model('Memberbiller');

    var save = function(){
        var password = exports.generate_password();
        member.password = password;
        member.save(function (err) {
            if (err) {
                return res.send(400, {
                    message: getErrorMessage(err),
                    member: member
                });
            } else {
                helper.sendMail(
                    member.email,
                    'Your Account Information',
                        'Hi '+member.first_name+' '+member.last_name+','+
                        '<br />'+
                        '<br />'+
                        'Here is your password: '+password+
                        '<br/>'+
                        '<br/>',
                    null,
                    function (status) {
//						if(status==='Failed'){
//							res.send(400, {message:helper.TransactionResponse.TransactionEmailSendingFailed});
//							return;
//						}
                    }
                );
                res.jsonp(member);
            }
        });
    };

    var saveBill = function(){
        bil.forEach(function(biller){
            biller.biller_name = biller.biller.name;
            biller.biller = biller.biller._id;
            var _biller = new Memberbiller(biller);
            _biller.member = member._id;
            _biller.member_name = member.first_name + ' ' + member.last_name;
            _biller.save(function(err, _bil){
               if(err){
                   return res.send(400, {
                       message: {general:'Error saving biller'},
                       member: member
                   });
               } else {
                   member.biller_link.push(_bil._id);
                   if(loa.length>0){
                       saveLoan();
                   } else {
                       save();
                   }
               }
            });
        });
    };

    var saveBen = function(){
        ben.forEach(function (beneficiary) {
            beneficiary.country_name = beneficiary.country.name;
            beneficiary.country = beneficiary.country._id;
            var _beneficiary = new Beneficiary(beneficiary);

            _beneficiary.member = member._id;
            _beneficiary.member_name = member.first_name + ' ' + member.last_name;

            _beneficiary.save(function (err, _ben) {
                if(err){
                    res.send(400, {
                        message: {general:'Error saving beneficiary'},
                        member: member
                    });
                } else {
                    member.beneficiaries_link.push(_ben._id);

                    if (beneficiary === ben[ben.length - 1]) {
                        if(bil.length>0){
                            saveBill();
                        }else{
                            if(loa.length>0){
                                saveLoan();
                            } else {
                                save();
                            }
                        }
                    }
                }
            });
        });
    };

    var saveLoan = function(){
        var Memberloans = mongoose.model('Memberloans');
        loa.forEach(function (loan) {
            var _loan = new Memberloans(loan);

            _loan.member = member._id;
            _loan.member_name = member.first_name + ' ' + member.last_name;

            _loan.save(function (err, _loan) {
                if(err){
                    res.send(400, {
                        message: {general:'Error saving beneficiary'},
                        member: member
                    });
                } else {
                    member.loans_link.push(_loan._id);

                    member.addEwallet(_loan.original_value.value);

                    if (loan === loa[loa.length - 1]) {
                        save();
                    }
                }
            });
        });
    };

    var populate = function(next){
        var populateCountry = function(n){
            var Country = mongoose.model('Country');
            Country.findById(member.country).exec(function(err, country){
                if(err){
                    res.send(400,{
                        message:{general:'Error populating country'}
                    });
                } else {
                    member.country_name = country.name;
                    n();
                }
            });
        };

        var populatePartner = function(n){
            var getPartner = function(id, callback){
                var Partner = mongoose.model('Partner');
                Partner.findById(id).exec(function(err,partner){
                    if(err){
                        res.send(400,{
                            message:{general:'Error populating remittance'}
                        });
                    } else {
                        callback(partner.name);
                    }
                });
            };

            getPartner(member.remittance, function(name){
                member.remittance_name = name;
                getPartner(member.microfinance, function(name){
                    member.microfinance_name = name;
                    n();
                });
            });

        };

        populateCountry(function(){
            populatePartner(next);
        });
    };

    var password = exports.generate_password();
    member.password = password;
    member.save(function(err, member) {
        if (err) {
            return res.send(400, {
                message: getErrorMessage(err)
            });
        } else {
            member.password = undefined;
            member.salt = undefined;

            populate(function(){
                if(ben.length>0) {
                    saveBen();
                } else if (bil.length>0){
                    saveBill();
                } else if (loa.length>0){
                    saveLoan();
                } else {
                    save();
                }
            });
        }
    });

};

/**
 * Get Data to Mobile App
 * @param req
 * @param res
 */
exports.update_data = function(req, res, next){
    var member;
    console.log(req.body);
    var id = req.body.data.id || req.memberId;
    var deviceID = req.body.data.deviceID || Math.floor(Math.random() * 10000);

    var popPartner = function(){
        var Partner = mongoose.model('Partner');
        console.log('populating members payout method and biller link');
        var promise = Partner.populate(member.remittance,[
            {path:'payout_method'},
            {path:'biller_link'}
        ]);
        promise.then(function(){
            console.log('done populating payout method and biller link');
            console.log('updating the device id:'+deviceID);
            member.isUpdated.push(deviceID);
            member.save(function(err){
                if(err){
                    console.log('error in saving member');
                    return delayed.end({
                        message:getErrorMessage(err)
                    });
                } else {
                    if(req.memberId){
                        console.log('finding coutnries');
                        var Country = mongoose.model('Country');
                        Country.find().exec(function(err, countries){
                            if(err){
                                console.log('error in populating countries');
                                delayed.end({
                                    message:getErrorMessage(err)
                                });
                            } else {
                                console.log('Logging in : '+req.memberId);
                                delayed.end(null, {
                                    code: 0,
                                    message : 'Success',
                                    member : member,
                                    countries : countries
                                });
                            }
                        });
                    } else {
                        console.log('sending output request');
                        delayed.end(null, {
                            code: 0,
                            message : 'Success',
                            member: member
                        });
                    }
                }
            });
        });
    };

    var popBenCountry = function(next){
        var counter = 0;
        var opts = [{ path: 'country' }];
        console.log('populating beneficiaries countries');
        member.beneficiaries_link.forEach(function (beneficiary) {
            var Beneficiary = mongoose.model('Beneficiary');
            var promise = Beneficiary.populate(beneficiary, opts);
            console.log('populating beneficiary: '+beneficiary._id);
            promise.then(function (beneficiary) {
                counter++;
                console.log('done populating beneficiary: '+beneficiary._id);
                if (counter === member.beneficiaries_link.length) {
                    console.log('done populating all beneficiaries');
                    next();
                }
            }).end();
        });
    };

    var popBiller = function(next){
        var counter = 0;
        var opts = [{ path: 'biller' }];
        member.biller_link.forEach(function (biller) {
            var Memberbiller = mongoose.model('Memberbiller');
            var promise = Memberbiller.populate(biller, opts);
            promise.then(function (biller) {
                counter++;
                if (counter === member.biller_link.length) {
                    next();
                }
            }).end();
        });
    };

    var popTransactions = function(next){
        var counter = 0;
        var opts = [
            { path: 'remitted_to' },
            { path: 'remitted_to_contact' },
            { path: 'payout_method' }
        ];
        console.log('populating transactions');
        member.transactions.forEach(function (transaction) {
            var Transaction = mongoose.model('Transaction');
            var promise = Transaction.populate(transaction, opts);
            console.log('populating transaction:'+transaction._id);
            promise.then(function (transaction) {
                counter++;
                console.log('done populating transaction:'+transaction._id);
                if (counter === member.transactions.length) {
                    console.log('done populating all transactions');
                    next();
                }
            }).end();
        });
    };

    var popRemRec = function(next){
        var counter = 0;
        var opts = [
            { path: 'member' }
        ];
        console.log('populating remitances received');
        member.remittance_received.forEach(function (transaction) {
            var Transaction = mongoose.model('Transaction');
            var promise = Transaction.populate(transaction, opts);
            console.log('populating remitance transaction:'+transaction._id);
            promise.then(function (transaction) {
                counter++;
                console.log('done populating remitance transaction:'+transaction._id);
                if (counter === member.remittance_received.length) {
                    console.log('done populating all remitance transactions');
                    next();
                }
            }).end();
        });
    };

    var checkChanges = function(next){
//        console.log('checking changes');
        Member.findById(id).select('isUpdated').exec(function(err, member){
            if(err){
                console.log('error finding member by id: '+id);
                return delayed.end({
                    message:getErrorMessage(err)
                });
            } else {
                if(!member){
                    console.log('cannot find member by id: '+id);
                    return delayed.end({
                        message:'Unknown member'
                    });
                } else {
                    if(_.indexOf(member.isUpdated,deviceID)===-1||req.memberId||!deviceID){
                        console.log('has update from '+deviceID + ' member id ' + req.memberId);
                        next();
                    }
                }
            }
        });
    };
    var getUpdate = function(){
        checkChanges(function(){
            console.log('Finding member by id: ' + id);
            Member.
                findById(id).
                select('-password -salt').
                populate('remittance').
                populate('microfinance').
                populate('country').
                populate('transactions').
                populate('remittance_received').
                populate('beneficiaries_link').//, null, {status: {$in:['Active']}}
                populate('contacts_link').//, null, {status: {$in:['Active']}}
                populate('biller_link').//, null, {status: {$in:['Active']}}
                populate('loans_link').//, null, {status: {$in:['Active']}}
                exec(function(err, _member){
                    if(err){
                        console.log('error finding member by id:'+id);
                        return delayed.end({
                            message:helper.getErrorMessage(err)
                        });
                    }
                    if(_member){
                        member = _member;
//                console.log('pasok');
                        var ben_len = member.beneficiaries_link.length;
                        var bil_len = member.biller_link.length;
                        var tran_len = member.transactions.length;
                        var rem_len = member.remittance_received.length;
                        if(rem_len>0){
                            popRemRec(function(){
                                if(ben_len>0){
                                    popBenCountry(function(){
                                        if(bil_len>0){
                                            popBiller(function(){
                                                if(tran_len>0){
                                                    popTransactions(popPartner);
                                                } else {
                                                    popPartner();
                                                }
                                            });
                                        } else if(tran_len>0){
                                            popTransactions(popPartner);
                                        } else {
                                            popPartner();
                                        }
                                    });
                                } else {
                                    if(bil_len>0){
                                        popBiller(function(){
                                            if(tran_len>0){
                                                popTransactions(popPartner);
                                            } else {
                                                popPartner();
                                            }
                                        });
                                    } else if(tran_len>0){
                                        popTransactions(popPartner);
                                    } else {
                                        popPartner();
                                    }
                                }
                            });
                        }
                        else if(ben_len>0){
                            popBenCountry(function(){
                                if(bil_len>0){
                                    popBiller(function(){
                                        if(tran_len>0){
                                            popTransactions(popPartner);
                                        } else {
                                            popPartner();
                                        }
                                    });
                                } else if(tran_len>0){
                                    popTransactions(popPartner);
                                } else {
                                    popPartner();
                                }
                            });
                        } else if(bil_len>0){
                            popBiller(function(){
                                if(tran_len>0){
                                    popTransactions(popPartner);
                                } else {
                                    popPartner();
                                }
                            });
                        } else if(tran_len>0){
                            popTransactions(popPartner);
                        } else {
                            popPartner();
                        }
                    } else {
                        console.log('cannot find member');
                        delayed.end({
                            message:'Can find member'
                        });
                    }
                });
        });
    };

    var delayed = new DelayedResponse(req, res);

    delayed.json().on('poll', getUpdate).start(1000);
};

/**
 * Show the current Member
 */
exports.read = function(req, res) {
    var member;

    var popPartner = function(){
        var Partner = mongoose.model('Partner');
        var promise = Partner.populate(member.remittance,[
            {path:'payout_method'},
            {path:'biller_link'}
        ]);
        promise.then(function(){
            res.jsonp(member);
        });
    };

    var popBenCountry = function(next){
        var counter = 0;
        var opts = [{ path: 'country' }];
        member.beneficiaries_link.forEach(function (beneficiary) {
            var Beneficiary = mongoose.model('Beneficiary');
            var promise = Beneficiary.populate(beneficiary, opts);
            promise.then(function (beneficiary) {
                counter++;
                if (counter === member.beneficiaries_link.length) {
                    next();
                }
            }).end();
        });
    };

    var popBiller = function(next){
        var counter = 0;
        var opts = [{ path: 'biller' }];
        member.biller_link.forEach(function (biller) {
            var Memberbiller = mongoose.model('Memberbiller');
            var promise = Memberbiller.populate(biller, opts);
            promise.then(function (biller) {
                counter++;
                if (counter === member.biller_link.length) {
                    next();
                }
            }).end();
        });
    };

    var popTransactions = function(next){
        var counter = 0;
        var opts = [{ path: 'remitted_to' }, { path: 'payout_method' }];
        member.transactions.forEach(function (transaction) {
            var Transaction = mongoose.model('Transaction');
            var promise = Transaction.populate(transaction, opts);
            promise.then(function (transaction) {
                counter++;
                if (counter === member.transactions.length) {
                    next();
                }
            }).end();
        });
    };

    Member.
        findById(req.member._id).
        select('-password -salt').
        populate('transactions').
        populate('beneficiaries_link').//, null, {status: {$in:['Active']}}
        populate('biller_link').//, null, {status: {$in:['Active']}}
        populate('loans_link').//, null, {status: {$in:['Active']}}
//        populate('remittance.biller_link').
//        populate('remittance.payout_method').
//        populate('beneficiaries.country').
//        populate('biller_link.biller').
//        populate('transactions.payout_method').
//       populate('transactions.remitted_to').
        exec(function(err, _member){
            member = _member;
            var ben_len = member.beneficiaries_link.length;
            var bil_len = member.biller_link.length;
            var tran_len = member.transactions.length;
            if(ben_len>0){
                popBenCountry(function(){
                    if(bil_len>0){
                        popBiller(function(){
                            if(tran_len>0){
                                popTransactions(popPartner);
                            } else {
                                popPartner();
                            }
                        });
                    } else if(tran_len>0){
                        popTransactions(popPartner);
                    } else {
                        popPartner();
                    }
                });
            } else if(bil_len>0){
                popBiller(function(){
                    if(tran_len>0){
                        popTransactions(popPartner);
                    } else {
                        popPartner();
                    }
                });
            } else if(tran_len>0){
                popTransactions(popPartner);
            } else {
                popPartner();
            }
        });
};

/**
 * Update a Member
 */
exports.update = function(req, res) {
    var _ben = JSON.parse(JSON.stringify(req.body.beneficiaries_link));
    var _bil = JSON.parse(JSON.stringify(req.body.biller_link));
    var _loa = JSON.parse(JSON.stringify(req.body.loans_link));
//    console.log(req.body.biller_link);
    delete req.body.biller_link;
    delete req.body.beneficiaries_link;
    delete req.body.loans_link;
    delete req.body.transactions;

    var old_data = JSON.parse(JSON.stringify(req.member));
    var member = _.extend(req.member, req.body);

    helper.addAuditTrails('Members', old_data, member, req.user._id);

    if(member.isModified()){
        member.isUpdated = [];
    }

    var save = function(){
        member.save(function(err) {
            if (err) {
                console.log(err);
                return res.send(400, {
                    message: getErrorMessage(err)
                });
            } else {
                req.member = member;
                exports.read(req, res);
            }
        });
    };

    var saveBen = function(){
        var total = _ben.length;
        var counter = 0;
        var Beneficiary = mongoose.model('Beneficiary');
        _ben.forEach(function(beneficiary){
            Beneficiary.findOne({_id: beneficiary._id}).exec(function (err, ben) {
                if (err) {
                    res.end(400, {
                        message: {general:'Error populating beneficiary'}
                    });
                } else {
                    beneficiary.country_name = beneficiary.country.name;
                    beneficiary.country = beneficiary.country._id;
                    if (ben) {
                        var old_data = JSON.parse(JSON.stringify(ben));
                        ben = _.extend(ben, beneficiary);
                        helper.addAuditTrails('Beneficiary', old_data, ben, req.user._id);
                    } else {
                        ben = new Beneficiary(beneficiary);
                    }
                    ben.member = member._id;
                    ben.member_name = member.first_name + ' ' + member.last_name;
                    ben.save(function (err, _ben_) {
                        if (err) {
                            res.send(400, {
                                message: {general:'Error saving beneficiary'}
                            });
                        } else {
                            var found = false;
                            for(var i in member.beneficiaries_link){
                                if(_.isEqual(member.beneficiaries_link[i],_ben_._id)){
                                    found = true;
                                }
                            }
                            if(!found){
                                member.beneficiaries_link.push(_ben_._id);
                            }
                            counter++;
                            if (counter === total) {
                                if(_bil.length>0){
                                    saveBil();
                                } else {
                                    if(_loa.length>0){
                                        saveLoan();
                                    } else {
                                        save();
                                    }
                                }
                            }
                        }
                    });
                }
            });
        });
    };

    var saveBil = function(){
        var total = _bil.length;
        var counter = 0;
        var Memberbiller = mongoose.model('Memberbiller');
        _bil.forEach(function(biller){
            Memberbiller.findOne({_id:biller._id}).exec(function(err, bil){
               if(err){
                   res.send(400, {
                       message: {general:'Error populating biller'}
                   });
               } else {
                   biller.biller_name = biller.biller.name;
                   biller.biller = biller.biller._id;
                   if(bil){
                       var old_data = JSON.parse(JSON.stringify(bil));
                       bil = _.extend(bil, biller);
                       helper.addAuditTrails('Membersbiller', old_data, bil, req.user._id);
                   } else {
                       bil = new Memberbiller(biller);
                   }
                   bil.member = member._id;
                   bil.member_name = member.first_name + ' ' + member.last_name;
                   bil.save(function(err, bil){
                       if(err){
                           res.send(400, {
                               message: {general:'Error saving biller'}
                           });
                       } else {
                           var found = false;
                           for(var i in member.biller_link){
                               if(_.isEqual(member.biller_link[i],bil._id)){
                                   found = true;
                               }
                           }
                           if(!found){
                               member.biller_link.push(bil._id);
                           }
                           counter++;
                           if (counter === total) {
                               if(_loa.length>0){
                                   saveLoan();
                               } else {
                                   save();
                               }
                           }
                       }
                   });
               }
            });
        });
    };

    var saveLoan = function(){
        var total = _loa.length;
        var counter = 0;
        var Memberloans = mongoose.model('Memberloans');
        _loa.forEach(function(loan){
            Memberloans.findOne({_id:loan._id}).exec(function(err, loa){
                if(err){
                    res.send(400, {
                        message: {general:'Error populating loan'}
                    });
                } else {
                    if(loa){
                        var old_data = JSON.parse(JSON.stringify(loa));
                        loa = _.extend(loa, loan);
                        helper.addAuditTrails('Memberloans', old_data, loa, req.user._id);
                    } else {
                        loa = new Memberloans(loan);
                        member.addEwallet(loa.original_value.value);
                    }
                    loa.member = member._id;
                    loa.member_name = member.first_name + ' ' + member.last_name;

                    loa.save(function(err, loa){
                        if(err){
                            res.send(400, {
                                message: {general:'Error saving loan'}
                            });
                        } else {
                            var found = false;
                            for(var i in member.loans_link){
                                if(_.isEqual(member.loans_link[i],loa._id)){
                                    found = true;
                                }
                            }
                            if(!found){
                                member.loans_link.push(loa._id);
                            }
                            counter++;
                            if (counter === total) {
                                save();
                            }
                        }
                    });
                }
            });
        });
    };

    var populate = function(next){
        var populateCountry = function(n){
            var Country = mongoose.model('Country');
            Country.findById(member.country).exec(function(err, country){
                if(err){
                    res.send(400,{
                        message:{general:'Error populating country'}
                    });
                } else {
                    member.country_name = country.name;
                    n();
                }
            });
        };

        var populatePartner = function(n){
            var getPartner = function(id, callback){
                var Partner = mongoose.model('Partner');
                Partner.findById(id).exec(function(err,partner){
                    if(err){
                        res.send(400,{
                            message:{general:'Error populating remittance'}
                        });
                    } else {
                        callback(partner.name);
                    }
                });
            };

            getPartner(member.remittance, function(name){
                member.remittance_name = name;
                getPartner(member.microfinance, function(name){
                    member.microfinance_name = name;
                    n();
                });
            });

        };

        populateCountry(function(){
            populatePartner(next);
        });
    };

    populate(function(){
        if(_ben.length>0) {
            saveBen();
        } else if(_bil.length>0){
            saveBil();
        } else if(_loa.length>0){
            saveLoan();
        } else {
            save();
        }
    });
};

/**
 * Delete an Member
 */
exports.delete = function(req, res) {
	var member = req.member ;

	member.remove(function(err) {
		if (err) {
			return res.send(400, {
				message: getErrorMessage(err)
			});
		} else {
			res.jsonp(member);
		}
	});
};

/**
 * List of Members
 */
exports.list = function(req, res) {
    var page = req.query.page || 1;
    var sort = req.query.sort || 'date_created';
    var by = req.query.by === 'true' ? '' : '-';
    var limit = 10;

    var skip = (page - 1) * limit;

    var where = {};

    if(req.query.hasCardNumber==='true'){
        where.CardNbr = {$ne: null};
    }

    if(req.query.KYCStatus){
        if(String(req.query.KYCStatus)==='pending'){
            where.KYCStatus =
                {$exists:false, $in: [req.query.KYCStatus,'',null]};
        } else {
            where.KYCStatus = {$in: [req.query.KYCStatus]};
        }
    }
    console.log(where);
    Member.find(where).sort(by+sort).skip(skip).limit(limit).populate('country'). exec(function(err, members) {
		if (err) {
			return res.send(400, {
				message: getErrorMessage(err)
			});
		} else {
			res.jsonp(members);
		}
	});
};

exports.countAll = function(req, res){
    Member.count({}, function (err, count) {
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

/**
 * Reset Password
 * @param req
 * @param res
 */
exports.reset_password = function(req, res){
    var member = req.member ;

    member = _.extend(member , req.body);

    var password = exports.generate_password();

    member.password = password;

    member.isAccountVirgin = true;

    member.save(function(err) {
        if (err) {
            return res.send(400, {
                message: getErrorMessage(err)
            });
        } else {
            helper.sendMail(
                member.email,
                'Your Account Information',
                    'Hi '+member.first_name+' '+member.last_name+','+
                    '<br />'+
                    '<br />'+
                    'Here is your password: '+password+
                    '<br/>'+
                    '<br/>',
                null,
                function (status) {
//					if(status==='Failed'){
//						res.send(400, {message:helper.TransactionResponse.TransactionEmailSendingFailed});
//                    	return;
//					}
                }
            );
            res.jsonp(member);
        }
    });
};

exports.sendKYC = function(req, res){
    var data = [['FileSeqID',
        'Type',
        'Operation',
        'CardNbr',
        'Title',
        'LastName',
        'FirstName',
        'MiddleName',
        'Birthday',
        'Gender',
        'CivilStatus',
        'Birthplace',
        'Citizenship',
        'AddressType',
        'UnitApt',
        'StreetAddress1',
        'StreetAddress2',
        'StreetAddress3',
        'StreetAddress4',
        'PostCode',
        'ProvinceCode',
        'StateCode',
        'CountryCd',
        'MailingAddressYN',
        'ContactEmail',
        'PhoneNbr',
        'LandLineNbr',
        'SSSID',
        'SSSIssuanceDate',
        'DrvLicenseID',
        'DrvIssuanceDate',
        'DrvExpiryDate',
        'PassportNbr',
        'PassportIssuanceDate',
        'PassportExpiryDate',
        'MothersMaidenSurname',
        'MothersFirstName',
        'MothersBirthday',
        'FathersSurname',
        'FathersFirstname',
        'CompanyName',
        'CompanyAddress1',
        'CompanyAddress2',
        'CompanyAddress3',
        'CompanyAddress4',
        'CompanyPostCode',
        'CompanyCountryCd',
        'Supervisor',
        'WorkTitle',
        'OfficeNbr',
        'EstSalary',
        'YearsWorked',
        'EmploymentStartYear',
        'UDFFieldTrack3',
        'PhotoFile',
        'CardPrintName',
        'UDFPerso1',
        'UDFPerso2',
        'UDFPerso3',
        'UDF1',
        'UDF2',
        'UDF3']];
    var ids = [];
    _.forEach(req.body, function(val, key){
        if(val) {
            ids.push(key);
        }
    });

    var counter = 0;

    var error_id = [];
    var success_id = [];

    var batch_id = null;

    var sendEmailToPVB = function(path, filename, callback){
        var config = require('../../config/config');
        helper.sendMail(
            config.kyc_email,
            'New KYC Application',
            'Hi,<br /><br />We sent new batch of KYC Application.<br/>Please see attachment.<br/><br/>Regards,<br/>Codehood Team.',
            [{
                path: path
            }],
            callback
        );
    };

    var generateCSV = function(callback){
        var fs = require('fs');
        var csv = require('fast-csv');
        var dateFormat = require('dateformat');
        var now = new Date();

        helper.getKYCSeqNo(function(seqno){
            batch_id = seqno;
            var filename = '053-'+dateFormat(now, 'mmddyyyyhhmmss')+'-DATA'+'.csv';
            var file = 'csv_omni_load/'+filename;
            csv
                .writeToPath(file, data, {headers: true})
                .on('finish', function(){
                    console.log('done!');
                    callback(file, filename);
                });
        });
    };

    var updateLog = function(status, path, filename, callback){
        var KycSending = mongoose.model('KycSending');
        var kycsending = new KycSending({
            status: status,
            members: success_id,
            batch_number: batch_id,
            path: path,
            file_name: filename
        });
        kycsending.save(function(err){
            if(err){
                console.log(err);
            } else {
                callback();
            }
        });
    };

    var populate = function(id){
        if(counter===ids.length){
            if(error_id.length===0){
                generateCSV(function(path,dpath){
                    sendEmailToPVB(path, dpath, function(status){
                        console.log('callback has been called after sending email');
                        updateLog(status, path, dpath, function(){
                            Member.find({_id: {$in:success_id}}).select('-password -salt').exec(function(err, members){
                                members.forEach(function(member){
                                    member.KYCStatus = 'Sent';
                                    member.save(function(err){

                                    });
                                });
                            });
                            res.jsonp({result:'ok',error: error_id});
                        });
                    });
                });
            } else {
                res.jsonp({result:'error',error: error_id});
            }
        } else {
            Member.findById(id).populate('country company_country').exec(function(err, member){
                    if(err){
                        console.log('---1---');
                        console.log(err);
                        console.log('---1---');
                    } else {
                        try{
                            var df = require('dateformat');
                            var issuance_date = df(member.sss_id_issuance_date, 'mmddyyyy');
                            console.log(issuance_date);

                            data.push([counter+1,
                                'CARDAPP',
                                'A',
                                member.CardNbr === '' ? '0' : member.CardNbr,
                                member.title,
                                member.last_name,
                                member.first_name,
                                member.middle_name,
                                df(member.birthday,'mmddyyyy'),
                                member.Gender,
                                member.civil_status,
                                member.birthplace,
                                member.citizenship,
                                member.address_type,
                                ' ',
                                member.address1,
                                member.address2 === '' ? ' ' : member.address2,
                                ' ',
                                ' ',
                                member.zipcode,
                                member.provincial_code,
                                ' ',
                                member.country.name,
                                member.is_mailing_address ? 'Y' : 'N',
                                member.email,
                                member.mobile,
                                member.phone1,
                                member.sss_id_number,
                                df(member.sss_id_issuance_date, 'mmddyyyy'),
                                member.driverslicenseid,
                                df(member.drivers_license_issuance_date, 'mmddyyyy'),
                                df(member.driverslicenseexpirydate, 'mmddyyyy'),
                                member.passportid,
                                df(member.passport_issuance_date, 'mmddyyyy'),
                                df(member.passportexpirydate, 'mmddyyyy'),
                                member.mothers_maiden_surname,
                                member.mothers_first_name,
                                df(member.mothers_birthday, 'mmddyyyy'),
                                member.fathers_surname,
                                member.fathers_first_name,
                                member.company_name,
                                member.company_address1,
                                member.company_address2,
                                ' ',
                                ' ',
                                member.company_zipcode,
                                member.company_country.name,
                                ' ',
                                member.work_title,
                                member.company_phone1,
                                member.estimated_salary,
                                member.years_worked,
                                '0',
                                ' ',
                                ' ',
                                member.name_on_card,
                                ' ',
                                ' ',
                                ' ',
                                ' ',
                                ' ',
                                ' ']);
                            success_id.push(id);
                        } catch(e){
                            console.log(e);
                            error_id.push(id);
                        }

                        counter++;
                        populate(ids[counter]);
                    }
                });
        }
    };

    populate(ids[counter]);
};

exports.resendKYC = function(req, res){
    var KycSending = mongoose.model('KycSending');
    var counter = 0;
    var ids = [];
    _.forEach(req.body, function(val, key){
        if(val) {
            ids.push(key);
        }
    });

    _.forEach(ids, function(id){
        KycSending.findById(id).exec(function(err, kycsending){
            if(err){
                console.log(err);
            } else {
                sendEmailToPVB(kycsending.path, kycsending.file_name, function(status){
                    console.log('callback has been called after sending email');
                    updateLog(kycsending, status, function(){
                        counter++;
                        if(counter===ids.length){
                            res.jsonp({result:'ok'});
                        }
                    });
                });
            }
        });
    });

    var sendEmailToPVB = function(path, filename, callback){
        var config = require('../../config/config');
        helper.sendMail(
            config.kyc_email,
            'New KYC Application',
            'Hi,<br /><br />We sent new batch of KYC Application.<br/>Please see attachment.<br/><br/>Regards,<br/>Codehood Team.',
            [{   // file on disk as an attachment
                path: path
            }],
            callback
        );
    };

    var updateLog = function(kycsending, status, callback){
        kycsending.status = status;
        kycsending.save(function(err){
            if(err){
                console.log(err);
            } else {
                callback();
            }
        });
    };
};

exports.holdKYC = function(req, res){
    var ids = [];
    _.forEach(req.body, function(val, key){
        if(val) {
            ids.push(key);
        }
    });

    Member.find({_id: {$in:ids}}).select('KYCStatus').exec(function(err, members){
        members.forEach(function(member){
            member.KYCStatus = 'OnHold';
            member.save(function(err){

            });
        });
        res.jsonp({result:'ok'});
    });
};

/**
 * Member middleware
 */
exports.memberByID = function(req, res, next, id) {
    Member.findById(id).select('-password -salt').exec(function(err, member) {
		if (err) return next(err);
		if (! member) return next(new Error('Failed to load Member ' + id));
		req.member = member ;
		next();
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


// API INTEGRATION

exports.signin = function(req, res, next){
    Member.findOne({
        email: req.body.data.username
    }).exec(function(err, member) {
        if (err) {
            return res.send(400, {
                message: [helper.TransactionResponse.TransactionLoginFailed.message]
            });
        }
        if (!member) {
            return res.send(400,{
                message: [helper.TransactionResponse.TransactionLoginFailed.message]
            });
        }
        if (!member.authenticate(req.body.data.password)) {
            return res.send(400,{
                message: [helper.TransactionResponse.TransactionLoginFailed.message]
            });
        }
        member.password = undefined;
        member.salt = undefined;

        req.memberId = member._id;
        exports.update_data(req, res, next);
    });
};

/**
 * Change password from app
 * @param req
 * @param res
 */
exports.changePassword = function(req, res){
    var new_password = req.body.data.new_password;
    var old_password = req.body.data.old_password;
    var con_password = req.body.data.confirm_password;

    Member.findById(req.member._id).exec(function(err, member){

        if(!member.authenticate(old_password)){
            return res.send(400,helper.TransactionResponse.TransactionInvalidPassword);
        }

        if(new_password!==con_password){
            return res.send(400, helper.TransactionResponse.TransactionPasswordMismatch);
        }

        member.password = new_password;

        member.isAccountVirgin = false;

        member.save(function(err) {
            if (err) {
                console.log(err);
                return res.send(400, {
                    message: getErrorMessage(err)
                });
            } else {
                helper.sendMail(
                    member.email,
                    'Your Account Information',
                    'Hi '+member.first_name+' '+member.last_name+','+
                    '<br />'+
                    '<br />'+
                    'Here is your password: '+new_password+
                    '<br/>'+
                    '<br/>',
                    null,
                    function (status) {
//						if(status==='Failed'){
//							res.send(400, {message:helper.TransactionResponse.TransactionEmailSendingFailed});
//                    		return;
//						}
                    }
                );
                res.jsonp(member);
            }
        });
    });
};

exports.changeProfilePic = function(req, res){
    var ProfilePic = req.body.data.ProfilePic;

    Member.findById(req.member._id).select('-password -salt').exec(function(err, member){
        member.ProfilePic = ProfilePic;
        member.isUpdated = [];
        member.save(function(err) {
            if (err) {
                return res.send(400, {
                    message: getErrorMessage(err)
                });
            } else {
                req.memberId = member._id;
                exports.update_data(req, res);
            }
        });
    });
};

/**
 * AddContact
 * @param req
 * @param res
 * @constructor
 */
exports.AddContact = function(req, res){
    var contact = null;
    var member = null;
    var findContact = function(next){
          Member.findOne({email:req.body.data.email}).select('-password -salt').exec(function(err, _contact){
              if(err){
                  console.log(err);
                  return res.send(400,{
                      message: 'error finding contact'
                  });
              } else {
                  if(!_contact){
                      res.jsonp({
                          code: 1,
                          message: ['Contact not found'],
                          contact: contact
                      });
                  } else {
                      contact = _contact;
//                      if(_contact._id==member._id){
//                          res.jsonp({
//                              code: 1,
//                              message: ['You cannot add your self'],
//                              contact: contact
//                          });
//                      } else {
                          next();
//                      }
                  }
              }
          });
    };

    var findMember = function(next){
        Member.findById(req.member._id).select('-password -salt').exec(function(err, _member){
           if(err) {
               return res.send(400, {
                   message: 'Error finding member'
               });
           } else {
                if(!_member){
                    res.jsonp({
                        code: 2,
                        message: ['Member not found'],
                        contact: contact
                    });
                } else {
                    member = _member;
                    next();
                }
           }
        });
    };

    var insertContactToMember = function(next){
        var found = false;
        _.forEach(member.contacts_link, function(contact_){
            if(contact._id.equals(contact_)){
                found = true;
            }
        });
        console.log('found ba:'+found);
        if(!found){
            member.contacts_link.push(contact._id);
            member.contacts_status.push({
                member_id: contact._id,
                status: 'Pending'
            });
            next();
        } else {
            res.jsonp({
                code: 1,
                message: ['Duplicate contact request'],
                contact: contact
            });
        }
    };

    var insertContactToContact = function(next){
        var found = false;
        _.forEach(contact.contacts_link, function(contact_){
            if(member._id.equals(contact_)){
                found = true;
            }
        });
        console.log('found ba:'+found);
        if(!found){
            contact.contacts_link.push(member._id);
            contact.contacts_status.push({
                member_id: member._id,
                status: 'Waiting'
            });
            next();
        } else {
            res.jsonp({
                code: 1,
                message: ['Duplicate contact request'],
                contact: contact
            });
        }
    };

    var saveMember = function(next){
        member.isUpdated = [];
        member.save(function(err){
            if(err){
                return res.send(400, {
                    message: 'Error saving member'
                });
            } else {
                next();
            }
        });
    };

    var saveContact = function(next){
        contact.isUpdated = [];
        contact.save(function(err){
            if(err){
                return res.send(400, {
                    message: 'Error saving member'
                });
            } else {
                next();
            }
        });
    };

    var sendEmailToContact = function(){
        helper.sendMail(
            contact.email,
            'New contact request',
            'Hi, <br> <br> ' + member.first_name + ' ' + member.last_name + ' is requesting to be on your contact list. <br/> <br/> Thank you.'
        );
    };

    findContact(function(){
        findMember(function(){
            insertContactToMember(function(){
                insertContactToContact(function(){
                    saveMember(function(){
                        saveContact(function(){
                            sendEmailToContact();
                            res.jsonp({
                                code: 0,
                                message: 'Success',
                                contact: contact
                            });
                        });
                    });
                });
            });
        });
    });
};

exports.RequestAction = function(req, res){
    var contact = null;
    var member = null;
    var status = '';
    console.log(req.body.data);
    if(req.body.data.request_status){
        switch(req.body.data.request_status){
            case 'Approved':
                status = 'Approved';
                break;
            case 'Rejected':
                status = 'Rejected';
                break;
            default:
                return res.jsonp({
                    code: 999,
                    message: 'Invalid status'
                });
        }
    } else {
        return res.jsonp({
            code: 999,
            message: 'Missing parameter status'
        });
    }
    var findContact = function(next){
        Member.findById(req.body.data.contact_id).select('-password -salt').exec(function(err, _contact){
            if(err){
                console.log(err);
                return res.jsonp({
                    code: 999,
                    message: ['error finding contact']
                });
            } else {
                if(!_contact){
                    res.jsonp({
                        code: 1,
                        message: ['Contact not found'],
                        contact: contact
                    });
                } else {
                    contact = _contact;
                    next();
                }
            }
        });
    };

    var findMember = function(next){
        Member.findById(req.member._id).select('-password -salt').exec(function(err, _member){
            if(err) {
                return res.send(400, {
                    message: 'Error finding member'
                });
            } else {
                if(!_member){
                    res.jsonp({
                        code: 2,
                        message: ['Member not found'],
                        contact: contact
                    });
                } else {
                    member = _member;
                    next();
                }
            }
        });
    };

    var updateContactOfMember = function(next){
        _.forEach(member.contacts_status, function(id){
            var member_id = id.member_id;
            var contact_id = contact._id;
            if(member_id.equals(contact_id)){
                id.status = status;
                next();
            }
        });
    };

    var updateContactOfContact = function(next){
        _.forEach(contact.contacts_status, function(id){
            var member_id = id.member_id;
            var contact_id = member._id;
            console.log('CONTACT');
            console.log(member_id.equals(contact_id));
            if(member_id.equals(contact_id)){
                console.log(status);
                id.status = status;
                next();
            }
        });
    };

    var saveMember = function(next){
        member.isUpdated = [];
        member.save(function(err){
            if(err){
                return res.send(400, {
                    message: 'Error saving member'
                });
            } else {
                next();
            }
        });
    };

    var saveContact = function(next){
        contact.isUpdated = [];
        contact.save(function(err){
            if(err){
                return res.send(400, {
                    message: 'Error saving member'
                });
            } else {
                next();
            }
        });
    };

    var sendEmailToSender = function(){
        helper.sendMail(
            member.email,
            'You approved new contact',
            'Hi, <br> <br> ' + contact.first_name + ' ' + contact.last_name + ' is now in your contact list. <br/> <br/> Thank you.'
        );
    };
    var sendEmailToContact = function(){
        helper.sendMail(
            contact.email,
            'Contact request approved',
                'Hi, <br> <br> ' + member.first_name + ' ' + member.last_name + ' has approved your request. <br/> <br/> Thank you.'
        );
    };
    console.log('finding mmeber');
    findMember(function(){
        console.log('finding contat');
        findContact(function(){
            console.log('update contact of member');
            updateContactOfMember(function(){
                console.log('update contact of contact');
                updateContactOfContact(function(){
                    console.log('save member');
                    saveMember(function(){
                        console.log('save contact');
                        saveContact(function(){
                            sendEmailToContact();
                            sendEmailToSender();
                            console.log('send response');
                            exports.update_data(req, res);
                        });
                    });
                });
            });
        });
    });
};

/**
 * Require login routing middleware
 */
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