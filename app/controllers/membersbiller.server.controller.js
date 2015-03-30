'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    _ = require('lodash'),
    helper = require('../../app/controllers/app-helper'),
    Memberbiller = mongoose.model('Memberbiller');

/**
 * Get the error message from error object
 */
var getErrorMessage = function(err) {
    var message = '';
    console.log(err);
    if (err.code) {
        switch (err.code) {
            case 11000:
            case 11001:
                message = 'Transaction already exists';
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
var getTransactionMessage = function(code){
    var message = '';
    switch(code){
        case 0:
            message = 'Success';
            break;
        case 1:
            message = 'Insuficient Balance';
            break;
        case 2:
            message = 'Unknown member';
    }
    return message;
};
/**
 * Create a Membersbiller
 */
exports.create = function(req, res) {
};

/**
 * Show the current Membersbiller
 */
exports.read = function(req, res) {
    res.jsonp(req.memberbiller);
};

/**
 * Update a Membersbiller
 */
exports.update = function(req, res) {
    var memberbiller = req.memberbiller;
    if(typeof req.body.member === 'object'){
        req.body.member = req.body.member._id;
    }
    if(typeof req.body.biller === 'object'){
        req.body.biller = req.body.biller._id;
    }
    var member;

    var getMember = function(next){
        var Member = mongoose.model('Member');
        console.log(memberbiller.member);
        Member.findById(memberbiller.member).select('-password -salt').exec(function(err, _member){
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
        console.log(member);
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


    var old_data = JSON.parse(JSON.stringify(memberbiller));
    memberbiller = _.extend(memberbiller, req.body);

    helper.addAuditTrails('Memberbiller', old_data, memberbiller, req.user._id);

    memberbiller.save(function(err, memberbiller){
       if(err){
           res.send(400, {
               message:'Error updating member biller'
           });
       } else {
           // TODO: SEND EMAIL NOTOFICIATION
           getMember(function(){
               saveMember(function(){
                   res.jsonp(memberbiller);
               });
           });
       }
    });
};

/**
 * Delete an Membersbiller
 */
exports.delete = function(req, res) {
    var memberbiller = req.memberbiller;
    var saveMember = function(next){
        var Member = mongoose.model('Member');
        Member.findById(memberbiller.member).select('-password -salt').exec(function(err, member){
            if(err){
                res.send(400, {
                   message: getErrorMessage(err)
                });
            } else {
                if(member){
                    for (var i in member.biller_link) {
                        if (member.biller_link[i] === memberbiller._id) {
                            member.biller_link.splice(i, 1);
                        }
                    }
                    member.save(function(err){
                        if(err){
                            res.send(400, {
                                message: getErrorMessage(err)
                            });
                        } else {
                            next();
                        }
                    });
                } else {
                    next();
                }
            }
        });
    };

    var removeMemberBiller = function(){
        memberbiller.remove(function(err){
            if( err ){
                res.send(400,{
                    message: 'Error deleting member biller'
                });
            } else {
                res.jsonp(memberbiller);
            }
        });
    };
    saveMember(removeMemberBiller);
};

/**
 * List of Membersbillers
 */
exports.list = function(req, res) {
    var where = null;
    if(req.query.status){
        where = {
            status : req.query.status
        };
    }

    var page = req.query.page || 1;
    var sort = req.query.sort || 'date_created';
    var by = req.query.by === 'true' ? '' : '-';
    var limit = 10;

    var skip = (page - 1) * limit;

    var memberbillers;

    var populateMemberFields = function(next){
        var Member = mongoose.model('Member');
        var total = memberbillers.length;
        var counter = 0;
        var populate = function(memberbiller){
            var promise = Member.populate(memberbiller.member,[
                {path:'country'},
                {path:'remittance'},
                {path:'microfinance'}
            ]);
            promise.then(function(){
                console.log(memberbiller);
                if(counter === total-1){
                    next();
                } else {
                    counter++;
                    populate(memberbillers[counter]);
                }
            });
        };
        if(total>0){
            populate(memberbillers[counter]);
        } else {
            next();
        }
    };

    Memberbiller.
        find(where).
        sort(by+sort).
        skip(skip).
        limit(limit).
        populate('member').
        populate('biller').
        exec(function(err,_memberbillers){
           if(err){
               res.send(400,{
                   message:'Error populating member biller list'
               });
           } else {
               memberbillers = _memberbillers;
               populateMemberFields(function(){
                   res.jsonp(memberbillers);
               });
           }
        });
};

exports.countAll = function(req, res){
    Memberbiller.count({}, function (err, count) {
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
 * WebService - AddMemberBiller
 * @param req
 * @param res
 * @param app
 * @constructor
 */
exports.AddMemberBiller = function(req, res, app){
    var member;
    var biller_data = req.body.data.biller;
    req.body.data.biller = req.body.data.biller._id;
    var memberbiller = new Memberbiller(req.body.data);

    var getMember = function(next){
        var Member = mongoose.model('Member');
        member = req.member;
        next();
    };

    var addMemberBiller = function(next){
        memberbiller.status = 'Pending';
        memberbiller.member = member._id;
        memberbiller.member_name = member.first_name + ' ' + member.last_name;
        memberbiller.biller_name = biller_data.name;
        memberbiller.save(function(err){
           if(err){
               res.send(400,{
                   message: getErrorMessage(err)
               });
           } else {
               next();
           }
        });
    };

    var saveMember = function(next){
        console.log(memberbiller);
        member.biller_link.push(memberbiller._id);
        member.save(function(err){
           if(err){
               res.send(400,{
                   message: getErrorMessage(err)
               });
           } else {
               next();
           }
        });
    };

    var sendEmailNotification = function(){
        var config = require('../../config/config');
        res.render('transaction_email', {
            transaction: memberbiller,
            member : member
        }, function(err, html){
            helper.sendMail(
                null,
                'New Biller Application Received',
                html,
                null,
                function (status) {
                }
            );
        });
    };

    var sendResponse = function(){
        var promise = Memberbiller.populate(memberbiller, [{path:'biller'}]);
        promise.then(function(memberbiller){
            res.jsonp({
                code : 0,
                message : getTransactionMessage(0), // success
                memberbiller : memberbiller
            });
        });
    };

    getMember(function(){
        addMemberBiller(function(){
            saveMember(function(){
                sendEmailNotification(function(){
                });
                sendResponse();
            });
        });
    });
};

/**
 * Member middleware
 */
exports.memberbillerByID = function(req, res, next, id) {
    Memberbiller.findById(id).exec(function(err, memberbiller) {
        if (err) return next(err);
        if (! memberbiller) return next(new Error('Failed to load Member ' + id));
        req.memberbiller = memberbiller ;
        next();
    });
};

/**
 * Member authorization middleware
 */
exports.hasAuthorization = function(req, res, next) {
    next();
};