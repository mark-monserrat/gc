'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    _ = require('lodash');


exports.TransactionResponse = {
    TransactionSuccess : {
        code : 0,
        message : 'Success'
    },
    TransactionInsuficientBalance : {
        code : 1,
        message : 'Insuficient Balance'
    },
    TransactionUnknownMember : {
        code : 2,
        message : 'Unknown member'
    },
    TransactionBillerNotRegistered : {
        code: 3,
        message : 'Biller not registered'
    },
    TransactionEmailSendingFailed : {
        code : 4,
        message : 'There was an error sending the email notification to recipient'
    },
    TransactionInvalidPassword: {
        code: 5,
        message: 'Invalid password'
    },
    TransactionPasswordMismatch: {
        code: 6,
        message: 'Password mismatch'
    },
    TransactionLoginFailed: {
        code: 7,
        message: 'Invalid Login Credentials'
    }
};

exports.SendResponse = function(res, transaction, transactionResponse){
    res.jsonp({
        code : transactionResponse.code,
        message : [transactionResponse.message], // success
        transaction : transaction
    });
};

exports.addAuditTrails = function(tablename, oldData, newData, user){
    var mod = newData.modifiedPaths();
    var AuditTrails = mongoose.model('AuditTrails');
    var audittrails = new AuditTrails();
    for(var i in mod){
        audittrails.tablename = tablename;
        audittrails.user = user;
        audittrails.record_id = newData._id;
        audittrails.changes.push({
            field: mod[i],
            from: oldData[mod[i]],
            to: newData[mod[i]]
        });
        audittrails.save();
    }
};

/**
 * Get the error message from error object
 */
exports.getErrorMessage = function(err) {
    var message = {};
    if (err.code) {
        switch (err.code) {
            case 11000:
            case 11001:
                message = {general:'Record already exists'};
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
 * Get Card Topup Sequence Number
 * @param cb
 * pass 1 argument to callback
 * - number
 */
exports.getKYCSeqNo = function(cb){
    var SystemSettings = mongoose.model('Systemsettings');
    var pad = require('pad');
    exports.getTransactionDate(function(date, isReset) {
        SystemSettings.find({name: 'CurrentKYCSequenceNumber'}).exec(function (err, result) {
            if (err) {
                console.log('error');
                cb(null);
            } else {
                var updateSeqNo = function(){
                    var seqno;
                    if(result.length===0){
                        seqno = new SystemSettings({
                            name: 'CurrentKYCSequenceNumber',
                            value: '1'
                        });
                    } else {
                        seqno = result[0];
                        if(isReset){
                            seqno.value = '1';
                        } else {
                            seqno.value = parseInt(seqno.value)+1;
                        }
                    }
                    seqno.save(function(err){
                        if(err){
                            console.log('error');
                            cb(null);
                        } else {
                            cb(pad(3, seqno.value, '0'));
                        }
                    });
                };
                updateSeqNo();
            }
        });
    });
};
/**
 * Get Card Topup Sequence Number
 * @param cb
 * pass 1 argument to callback
 * - number
 */
exports.getCardTopupSeqNo = function(cb){
    var SystemSettings = mongoose.model('Systemsettings');
    var pad = require('pad');
    exports.getTransactionDate(function(date, isReset) {
        SystemSettings.find({name: 'CurrentSequenceNumber'}).exec(function (err, result) {
            if (err) {
                console.log('error');
                cb(null);
            } else {
                var updateSeqNo = function(){
                    var seqno;
                    if(result.length===0){
                        seqno = new SystemSettings({
                            name: 'CurrentSequenceNumber',
                            value: '1'
                        });
                    } else {
                        seqno = result[0];
                        if(isReset){
                            seqno.value = '1';
                        } else {
                            seqno.value = parseInt(seqno.value)+1;
                        }
                    }
                    seqno.save(function(err){
                        if(err){
                            console.log('error');
                            cb(null);
                        } else {
                            cb(pad(3, seqno.value, '0'));
                        }
                    });
                };
                updateSeqNo();
            }
        });
    });
};

/**
 * Get Transaction Date
 * @param cb - pass a method callback
 * pass 2 arguments to callback:
 * - current transaction date
 * - is reset boolean
 */
exports.getTransactionDate = function(cb){
    var SystemSettings = mongoose.model('Systemsettings');
    SystemSettings.find({name:'CurrentTransactionDate'}).exec(function(err, result){
        if(err){
            console.log('error');
            cb(null);
        } else {
            var dateFormat = require('dateformat');
            var updateDate = function(callback){
                var date;

                if(result){
                    date = new SystemSettings({
                        name: 'CurrentTransactionDate',
                        value: Date.now()
                    });
                } else {
                    date = result[0];
                    date.value = Date.now();
                }

                date.save(function(err){
                    if(err){
                        callback(null);
                    } else {
                        // returns true as reset
                        callback(date, true);
                    }
                });
            };
            if(result.length===0){
                updateDate(cb);
            } else {
                console.log(result);
                if(dateFormat(new Date(result[0].value*1000),'mmddyyyy')===dateFormat(Date.now(),'mmddyyyy')){
                    cb(dateFormat(result[0].value,'mmddyyyy'), false);
                } else {
                    updateDate(cb);
                }
            }
        }
    });
};

exports.sendMail = function(to, subject, messageHTML, attachment, callback){
    var config = require('../../config/config');
    var nodemailer = require('nodemailer');
    var smtpTransport = require('nodemailer-smtp-transport');
    if( to === null ){
        to = config.gochannel_admin;
    }
    var transporter = nodemailer.createTransport(smtpTransport({
        host: config.email_server,
        port: config.email_port,
        secure: true,
        auth: {
            user: config.email_username,
            pass: config.email_password
        },
        tls: {rejectUnauthorized: false}
    }));
    transporter.sendMail(
        {
            from: config.noreply_email,
            sender: config.noreply_email,
            to: to,
            subject: subject,
            html: messageHTML,
            attachments : attachment
        },function(err, info){
            if (err) {
                // handle error
                console.log(err);
                if(callback !== undefined) callback('Failed');
            } else {
                console.log(info);
                if(callback !== undefined) callback('Success');
            }
        }
    );
};