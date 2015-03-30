'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Transaction = mongoose.model('Transaction'),
	_ = require('lodash'),
    helper = require('../../app/controllers/app-helper');

/**
 * Update a Transaction
 */
exports.update = function(req, res, app) {
    var transaction = req.transaction;
    req.body.member = req.body.member._id;

    var old_data = JSON.parse(JSON.stringify(transaction));
    delete req.body.paid_bill_to;
    delete req.body.remitted_to;
    delete req.body.payout_method;
    transaction = _.extend(transaction, req.body);

    helper.addAuditTrails('Transaction', old_data, transaction, req.user._id);

    var generateCSV = function(callback){
        var fs = require('fs');
        var csv = require('fast-csv');
        var dateFormat = require('dateformat');
        var now = new Date();

        helper.getCardTopupSeqNo(function(seqno){
            var filename = 'LOAD-'+dateFormat(now, 'mmddyyyy')+'-'+seqno+'.csv';
            var file = 'csv_omni_load/'+filename;
            csv
                .writeToPath(file, [
                    [transaction.CardNbr, transaction.amount]
                ], {headers: true})
                .on('finish', function(){
                    console.log('done!');
                    callback(file, filename);
                });
        });
    };

    var sendViaFtp = function(file, to){
        require('shelljs/global');
        console.log('sending ftp');
        if (exec('sh /root/sftppvb.sh '+file + ' ' + to).code !== 0) {
//            res.jsonp({result:'ok'});
            console.log('ftp sent');
        }
    };

    var processTopUp = function(){
        var Member = mongoose.model('Member');
        Member.findById(transaction.member).select('-password -salt').exec(function(err, member){
            if(err){
                res.send(400, {
                    message : helper.getErrorMessage(err)
                });
            } else {
                if(!member){
                    helper.SendResponse(res, transaction, helper.TransactionResponse.TransactionUnknownMember);
                } else {
                    member.addEwallet(transaction.amount.value);
                    member.isUpdated = [];
                    member.save(function(err){
                        if(err){
                            res.send(400, {
                                message : helper.getErrorMessage(err)
                            });
                        } else {
                            saveTransaction(function(){
                                helper.SendResponse(res, transaction, helper.TransactionResponse.TransactionSuccess);
                                new EmailTopUpNotification(member, 'topup');
                            });
                        }
                    });
                }
            }
        });
    };
    var processPayLoan = function(){
        var Member = mongoose.model('Member');
        Member.findById(transaction.member).select('-password -salt').exec(function(err, member){
            if(err){
                res.send(400, {
                    message : helper.getErrorMessage(err)
                });
            } else {
                if(!member){
                    helper.SendResponse(res, transaction, helper.TransactionResponse.TransactionUnknownMember);
                } else {
                    member.deductEwallet(transaction.amount.value);
                    member.isUpdated = [];
                    member.save(function(err){
                        if(err){
                            res.send(400, {
                                message : helper.getErrorMessage(err)
                            });
                        } else {
                            saveTransaction(function(){
                                helper.SendResponse(res, transaction, helper.TransactionResponse.TransactionSuccess);
                                new EmailTopUpNotification(member, 'loan');
                            });
                        }
                    });
                }
            }
        });
    };
    var processRemittance = function(){
        var Member = mongoose.model('Member');
        Member.findById(transaction.member).select('-password -salt').exec(function(err, member){
            if(err){
                console.log(err);
                res.send(400, {
                    message : helper.getErrorMessage(err)
                });
            } else {
                if(!member){
                    helper.SendResponse(res, transaction, helper.TransactionResponse.TransactionUnknownMember);
                } else {
                    member.isUpdated = [];
                    member.save(function(err){
                        if(err){
                            console.log(err);
                            res.send(400, {
                                message : helper.getErrorMessage(err)
                            });
                        } else {
                            saveTransaction(function(){
                                helper.SendResponse(res, transaction, helper.TransactionResponse.TransactionSuccess);
                            });
                        }
                    });
                }
            }
        });
    };
    var processBillsPayment = function(){
        var Member = mongoose.model('Member');
        console.log('asd');
        Member.findById(transaction.member).select('-password -salt').exec(function(err, member){
            if(err){
                console.log(err);
                res.send(400, {
                    message : helper.getErrorMessage(err)
                });
            } else {
                if(!member){
                    helper.SendResponse(res, transaction, helper.TransactionResponse.TransactionUnknownMember);
                } else {
                    member.isUpdated = [];
                    member.save(function(err){
                        if(err){
                            res.send(400, {
                                message : helper.getErrorMessage(err)
                            });
                        } else {
                            saveTransaction(function(){
                                helper.SendResponse(res, transaction, helper.TransactionResponse.TransactionSuccess);
                            });
                        }
                    });
                }
            }
        });
    };
    var processCardTopup = function(){
        generateCSV(function(path,dpath){
            sendViaFtp(path,dpath);
            saveTransaction(function(){
                helper.SendResponse(res, transaction, helper.TransactionResponse.TransactionSuccess);
            });
        });
    };
    var EmailTopUpNotification = function(member){
        var template;
        switch(transaction.transaction_type){
            case 'TOPUP':
                template = 'topup_approved_email';
                break;
            case 'LOAN PAYMENT':
                template = 'loan_approved_email';
                break;
        }
        res.render(template, {
            member: member,
            transaction: transaction
        }, function(err, html){
            helper.sendMail(
                member.email,
                'Your '+transaction.transaction_type+' has been approved',
                html,
                null,
                function (status) {
                }
            );
        });
    };

    var saveTransaction = function(email){
        transaction.save(function(err, transaction){
            if(err){
                res.send(400, {
                    message: helper.getErrorMessage(err)
                });
            } else {
                if(typeof email !== 'undefined')
                    email();
                else {
                    helper.SendResponse(res, transaction, helper.TransactionResponse.TransactionSuccess);
                }
            }
        });
    };

    if(transaction.status==='Approve') {
        switch (transaction.transaction_type) {
            case 'TOPUP':
                processTopUp();
                break;
            case 'LOAN PAYMENT':
                processPayLoan();
                break;
            case 'CARD-TOPUP':
                processCardTopup();
                break;
        }
    } else if(transaction.status==='Cleared'){
        switch(transaction.transaction_type){
            case 'REMITTANCE':
                processRemittance();
                break;
            case 'BILLS PAYMENT':
                processBillsPayment();
                break;
        }
    } else {
        saveTransaction();
    }
};

/**
 * List of Transactions
 */
exports.list = function(req, res) {
    var where = {};
    if(req.query.transaction_type){
        where.transaction_type = req.query.transaction_type;
    }
    if(req.query.status){
        where.status = req.query.status;
    }
    if(req.query.partner){
        where.partner = req.query.partner;
    }

    if(req.query.member){
        where.member = req.query.member;
    }

    var or;
    if(req.query.wildcard_search){
        var wild = new RegExp(req.query.wildcard_search, 'i');
        or = [
            {reference_no: {$regex: wild}},
            {member_name: {$regex: wild}},
            {payout_method_name: {$regex: wild}},
            {paid_bill_to_name: {$regex: wild}},
            {amount: {$gte:req.query.wildcard_search,$lte:req.query.wildcard_search}}
        ];

//            member_name: new RegExp('^'+wild+'$', "i"),
//            remitted_to_name: new RegExp('^'+wild+'$', "i"),
//            payout_method_name: new RegExp('^'+wild+'$', "i"),
//            amount: {$gte:wild,$lte:wild},
//            paid_bill_to_name: new RegExp('^'+wild+'$', "i")
    }
    if(req.query.transaction_date_from){
        var start = req.query.transaction_date_from.split('-');
        start = new Date(start[0],start[1],start[2]);
        var end = req.query.transaction_date_to.split('-');
        end = new Date(end[0],end[1],end[2]);
        where.date_created = {'$gte': start, '$lt': end};
    }
    var transactions;
    var populateBiller = function(next){
        var Memberbiller = mongoose.model('Memberbiller');
        var count = 0;
        transactions.forEach(function(transaction){
            var promise = Memberbiller.populate(transaction.paid_bill_to,[{path:'biller'}]);
            promise.then(function(){
                count ++;
                if(count===transactions.length){
                    next();
                }
            }).end();
        });
    };

    var page = req.query.page || 1;
    var sort = req.query.sort || 'date_created';
    var by = req.query.by === 'true' ? '' : '-';
    var limit = req.query.limit || 10;

    var skip = (page - 1) * limit;

    var populateTransaction = function(next){
        console.log(where);
        console.log(or);
        Transaction.find(where)
            .or(or)
            .sort(by+sort)
            .skip(skip).limit(limit).
            populate('member').
            populate('remitted_to').
            populate('paid_bill_to').
            populate('payout_method').
            exec(function(err, _transactions) {
                if (err) {
                    console.log(err);
                    return res.send(400, {
                        message: helper.getErrorMessage(err)
                    });
                } else {
                    transactions = _transactions;
                    if(transactions.length>0){
                        next();
                    } else {
                        res.jsonp(transactions);
                    }
                }
            });
    };

    populateTransaction(function(){
        populateBiller(function(){
            res.jsonp(transactions);
        });
    });
};

exports.countAll = function(req, res){
    var where = {};
    if(req.query.transaction_type){
        where.transaction_type = req.query.transaction_type;
    }
    if(req.query.status){
        where.status = req.query.status;
    }

    Transaction.count(where, function (err, count) {
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
 * Top-Up Required Params (member, amount, payment_type)
 * Top-Up Optional Params (bank_name, deposit_date, slip_refno, slip_img)
 * @param req
 * @param res
 * @param app
 * @constructor
 */
exports.TopUp = function(req, res, app){
    var transaction = new Transaction(req.body.data);
    var member;

    var emailNotification = function(){
        res.render('transaction_email', {
            member: member,
            transaction: transaction
        }, function(err, html){
            helper.sendMail(
                null,
                'Top up received',
                html,
                null,
                function (status) {
                }
            );
        });
    };

    var getMember = function(next){
        var Member = mongoose.model('Member');
        Member.findById(transaction.member).select('-password -salt').exec(function(err, _member){
            if(err){
                res.send(400, {
                    message: helper.getErrorMessage(err)
                });
            } else {
                member = _member;
                if(!member){
                    helper.SendResponse(res, transaction, helper.TransactionResponse.TransactionUnknownMember);
                } else {
                    next();
                }
            }
        });
    };

    var saveMember = function(next){
        member.transactions.push(transaction._id);
        member.isUpdated = [];
        member.save(function(err){
            if(err){
                res.send(400, {
                    message: helper.getErrorMessage(err)
                });
            } else {
                next();
            }
        });
    };

    var saveTransaction = function(next){
        transaction.transaction_type = 'TOPUP';
        transaction.status = 'Pending';
        transaction.member = member._id;
        transaction.member_name = member.first_name + ' ' + member.last_name;
        transaction.save(function(err) {
            if (err) {
                return res.send(400, {
                    message: helper.getErrorMessage(err)
                });
            } else {
                next();
            }
        });
    };

    getMember(function(){
        saveTransaction(function(){
            saveMember(function(){
                emailNotification();
                helper.SendResponse(res, transaction, helper.TransactionResponse.TransactionSuccess);
            });
        });
    });
};

/**
 * Card Topup
 * @param req
 * @param res
 * @param app
 */
exports.addCardTopup = function(req, res, app){
    var transaction = new Transaction(req.body);
    var member;
console.log(transaction);
    var getMember = function(next){
        var Member = mongoose.model('Member');
        Member.findById(transaction.member).select('-password -salt').exec(function(err, _member){
            if(err){
                res.send(400, {
                    message: helper.getErrorMessage(err)
                });
            } else {
                member = _member;
                if(!member){
                    helper.SendResponse(res, transaction, helper.TransactionResponse.TransactionUnknownMember);
                } else {
                    next();
                }
            }
        });
    };

    var saveMember = function(next){
        member.transactions.push(transaction._id);
        member.isUpdated = [];
        member.save(function(err){
            if(err){
                res.send(400, {
                    message: helper.getErrorMessage(err)
                });
            } else {
                next();
            }
        });
    };

    var saveTransaction = function(next){
        transaction.transaction_type = 'CARD-TOPUP';
        transaction.status = 'Pending';
        transaction.member = member._id;
        transaction.member_name = member.first_name + ' ' + member.last_name;
        transaction.save(function(err) {
            if (err) {
                return res.send(400, {
                    message: helper.getErrorMessage(err)
                });
            } else {
                next();
            }
        });
    };

    getMember(function(){
        saveTransaction(function(){
            saveMember(function(){
                helper.SendResponse(res, transaction, helper.TransactionResponse.TransactionSuccess);
            });
        });
    });
};

/**
 * SendMoney Required Params (member,remitted_to,amount)
 * @param req
 * @param res
 * @param next
 */
exports.sendMoney = function(req, res, app){
    var payout_method = req.body.data.payout_method;
    var remitted_to = req.body.data.remitted_to;
    var remitted_to_contact = req.body.data.remitted_to_contact;
    if(req.body.data.payout_method){
        req.body.data.payout_method = req.body.data.payout_method._id;
    }
    var recipient_type = req.body.data.recipient_type;
    if(String(recipient_type) === 'beneficiary'){
        req.body.data.remitted_to = req.body.data.remitted_to._id;
    } else if( String(recipient_type) === 'contact' ) {
        req.body.data.remitted_to_contact = req.body.data.remitted_to_contact._id;
    }

    // initializing models
    var transaction = new Transaction(req.body.data);
    var member;
    var contact;

//    Steps
//    0. Validate PayoutMethod
    var validatePayoutMethod = function(next){
        if(String(recipient_type)==='contact'){
            transaction.partner_fee = 0;
            transaction.gochannel_fee = 0;
            transaction.payout_method_name = '';
            return next();
        }
        var PayoutMethod = mongoose.model('PayoutMethod');
        PayoutMethod.findById(payout_method._id, function(err, payout_method){
            if(err){
                res.send(400, {
                    message: helper.getErrorMessage()
                });
            } else {
                if(payout_method){
                    var RemittancePartner = mongoose.model('Partner');
                    RemittancePartner.findById(member.remittance).exec(function(err, partner){
                        if(err){
                            res.send(400, {
                                message: 'Error finding the remittance partner'
                            });
                        } else {
                            if(partner){
                                partner.payout_method.forEach(function(pmethod){
                                    if(payout_method._id.equals(pmethod)){
                                        transaction.partner_fee = payout_method.partner_fee;
                                        transaction.gochannel_fee = payout_method.gochannel_fee;
                                        transaction.payout_method_name = payout_method.name;
                                        return next();
                                    } else {
                                        if(pmethod === partner.payout_method[partner.payout_method.length-1]){
                                            res.send(400, {
                                                message: 'Remittance partner does not support that payout method'
                                            });
                                        }
                                    }
                                });
                            }
                        }
                    });
                } else {
                    res.send(400, {
                        message: 'Invalid payout method'
                    });
                }
            }
        });
    };
    var validateRecipient = function(next){
        if(String(recipient_type) === 'beneficiary'){
            console.log('checking beneficiary');
            var found = false;
            member.beneficiaries_link.forEach(function(beneficiary){
                console.log(beneficiary+'=='+req.body.data.remitted_to+' = '+beneficiary.equals(req.body.data.remitted_to));
                if(beneficiary.equals(req.body.data.remitted_to)){
                    found = true;
                }
            });
            if(found){
                return next();
            } else {
                return res.send(400, {
                    message: 'Beneficiary supplied is not registered to member'
                });
            }
        } else {
            console.log('checking contacts');
            member.contacts_link.forEach(function(contact_id){
                if(contact_id.equals(req.body.data.remitted_to_contact)){
                    var Member = mongoose.model('Member');
                    console.log('finding contact by id: '+contact_id);
                    Member.findById(contact_id).select('-password -salt').exec(function(err, contact_){
                        if(err){
                            return res.send(400, {
                                message: 'Error finding member contact record'
                            });
                        } else {
                            console.log('checking contact');
                            if(contact_){
                                contact = contact_;
                                console.log('contact found: '+contact._id);
                                return next();
                            } else {
                                return res.send(400, {
                                    message: 'contact not found'
                                });
                            }
                        }
                    });
                } else {
                    if(contact===member.contacts_link[member.contacts_link.length-1]){
                        return res.send(400, {
                            message: 'Contact supplied is not registered to member'
                        });
                    }
                }
            });
        }
    };
//   1. Check if ewallet has enough balance
    var toBeDeducted = null;
    var checkBalance = function(next){
        console.log('computing the total amount');
        toBeDeducted = transaction.amount.value + transaction.gochannel_fee.value + transaction.partner_fee.value;
        console.log('total amount is '+toBeDeducted);
        console.log('checking if enough balance');
        if(member.getEwalletBalance()>=toBeDeducted) {
            console.log('yes there is enough balance');
            next();
        } else {
            sendResponse(helper.TransactionResponse.TransactionInsuficientBalance); // insufient balance
        }
    };
//    2. if valid ewallet balance deduct amount to e-wallet balance
    var deductBalance = function(next){
        transaction.pre_balance = member.ewallet_balance.value;
        member.deductEwallet(toBeDeducted);
        transaction.post_balance = member.ewallet_balance.value;
        next();
    };
    var addBalanceToContact = function(next){
        contact.addEwallet(transaction.amount.value);
        next();
    };
//    3. if sent to recipient ewallet, add amount to recipient e-wallet (NOT APPLICABLE SINCE recipient is not treated as gochannel member)
//    4. add transaction to recipients as received(NOT APPLICABLE SINCE recipient is not treated as gochannel member)
//    5. save member transaction as remittance transaction type
    var saveMember = function(next){
        member.transactions.push(transaction._id);
        member.isUpdated = [];
        member.save(function(err){
            if(err){
                res.send(400, {
                    message: helper.getErrorMessage(err)
                });
            } else {
                next();
            }
        });
    };
    var saveContact = function(next){
//        member.transactions.push(transaction._id);
        console.log('updating contact: '+contact._id);
        contact.isUpdated = [];
        contact.remittance_received.push(transaction._id);
        contact.save(function(err){
            if(err){
                console.log(err);
                res.send(400, {
                    message: helper.getErrorMessage(err)
                });
            } else {
                console.log('contact has been updated');
                next();
            }
        });
    };
//    6. SaveTransaction
    var saveTransaction = function(next){
        transaction.transaction_type = 'REMITTANCE';
        transaction.status = 'Pending';
        transaction.member = member._id;
        transaction.member_name = member.first_name + ' ' + member.last_name;
        transaction.partner = member.remittance._id;
        transaction.partner_name = member.remittance.name;
        if(String(recipient_type)==='beneficiary'){
            transaction.remitted_to_name = remitted_to.first_name + ' ' + remitted_to.last_name;
        } else {
            transaction.remitted_to_name = remitted_to_contact.first_name + ' ' + remitted_to_contact.last_name;
        }

        transaction.save(function(err) {
            if (err) {
                return res.send(400, {
                    message: helper.getErrorMessage(err)
                });
            } else {
                next();
            }
        });
    };
//    7. Email recipient
    var EmailSendMoneyNotification = function(){
        var email = String(recipient_type) === 'beneficiary' ? remitted_to.email : remitted_to_contact.email;
        var recipient = String(recipient_type) === 'beneficiary' ? remitted_to : remitted_to_contact;
        res.render('remittance_email', {
            recipient: recipient,
            sender: member,
            payout_method: payout_method,
            amount : transaction.amount
        }, function(err, html){
            helper.sendMail(
                email,
                'You received a money',
                html,
                null,
                function (status) {
                }
            );
        });
    };
    var sendResponse = function(transactionResponse){
        var promise = Transaction.populate(transaction,[{path:'remitted_to'},{path:'payout_method'},{path:'remitted_to_contact'}]);
        promise.then(function(transaction){
            helper.SendResponse(res, transaction, transactionResponse);
        });
    };
    // Step 1
    var getMember = function(next) {

        var Member = mongoose.model('Member');
        Member.findById(transaction.member).select('-password -salt').populate('remittance').exec(function(err, _member) {
            if (err) {
                res.send(400, {
                    message: helper.getErrorMessage(err)
                });
            } else {
                // init member model
                member = _member;
                if (!_member) {
                    helper.SendResponse(res, transaction, helper.TransactionResponse.TransactionUnknownMember);
                } else {
                    next();
                }
            }
        });
    };

    console.log('Get member');
    getMember(function(){
        console.log('validate recipient');
        validateRecipient(function(){
            console.log('validate payout method');
            validatePayoutMethod(function(){
                console.log('check balance');
                checkBalance(function(){
                    console.log('deduct balance');
                    deductBalance(function(){
                        var continueTransaction = function(){
                            console.log('save transaction');
                            saveTransaction(function(){
                                console.log('save member');
                                saveMember(function(){
                                    sendResponse(helper.TransactionResponse.TransactionSuccess);
                                    new EmailSendMoneyNotification();
                                });
                            });
                        };
                        if(String(recipient_type) ==='contact'){
                            console.log('add balance to contact');
                            addBalanceToContact(function(){
                                console.log('save contact');
                                saveContact(function(){
                                    console.log('continue transaction');
                                    continueTransaction();
                                });
                            });
                        } else {
                            console.log('continue transaction');
                            continueTransaction();
                        }
                    });
                });
            });
        });
    });
};

/**
 * WebService - PayBills
 * @param req
 * @param res
 * @param app
 * @constructor
 */
exports.PayBills = function(req, res, app){
    var member = req.member;
    req.body.data.paid_bill_to = req.body.data.paid_bill_to._id;
    var transaction = new Transaction(req.body.data);

    var populateMember = function(next){
        var Member = mongoose.model('Member');
        var promise = Member.populate(member,[{path:'remittance'}]);
        promise.then(function(member){
            next();
        }).end();
    };

    var validateBiller = function(next){
        var found = false;
        var Memberbiller = mongoose.model('Memberbiller');
        Memberbiller.findById(transaction.paid_bill_to).exec(function(err, memberbiller){
            if(err){
                res.send(400,{
                    message:helper.getErrorMessage(err)
                });
            } else {
                if(!memberbiller){
                    console.log('Done validating biller... failed');
                    helper.SendResponse(res, transaction, helper.TransactionResponse.TransactionBillerNotRegistered);
                } else {
                    if(memberbiller.status!=='Approved'){
                        console.log('DOne validating biller... failed');
                        helper.SendResponse(res, transaction, helper.TransactionResponse.TransactionBillerNotRegistered);
                    } else {
                        console.log('Done validating biller.. success');
                        next();
                    }
                }
            }
        });
    };

    var checkBalance = function(next){
        console.log('checking balance');
        if(member.getEwalletBalance()<transaction.amount.value){
            console.log('checking balance failed');
            helper.SendResponse(res, transaction, helper.TransactionResponse.TransactionInsuficientBalance);
        } else {
            console.log('checking balance succeeded');
            next();
        }
    };

    var deductBalance = function(next){
        console.log('deduct balance ');
        member.deductEwallet(transaction.amount.value);
        member.deductEwallet(member.remittance.gochannel_fee.value);
        member.deductEwallet(member.remittance.partner_fee.value);
        console.log('deduct balance succeeded');
        next();
    };

    var getMemberbiller = function(next){
        var Memberbiller = mongoose.model('Memberbiller');
        Memberbiller.findById(transaction.paid_bill_to).populate('biller').exec(function(err, memberbiller){
           if(err){
               res.send(400, {
                   message : helper.getErrorMessage(err)
               });
           } else {
               transaction.paid_bill_to_name = memberbiller.biller.name;
               next();
           }
        });
    };

    var saveTransaction = function(next){
        console.log('saving transaction');
        transaction.gochannel_fee = member.remittance.gochannel_fee;
        transaction.partner_fee = member.remittance.partner_fee;
        transaction.transaction_type = 'BILLS PAYMENT';
        transaction.status = 'Pending';
        transaction.member = member._id;
        transaction.member_name = member.first_name + ' ' + member.last_name;
        transaction.partner = member.remittance;
        getMemberbiller(function(){
            transaction.save(function(err){
                if(err){
                    res.send(400, {
                        message : helper.getErrorMessage(err)
                    });
                } else {
                    console.log('saving transaction succeded');
                    next();
                }
            });
        });
    };

    var saveMember = function(next){
        console.log('saving member');
        member.transactions.push(transaction._id);
        member.isUpdated = [];
        member.save(function(err){
            if(err){
                res.send(400, {
                    message: helper.getErrorMessage(err)
                });
            } else {
                console.log('saving member succeded');
                next();
            }
        });
    };

    var EmailAdminNotification = function(next){
        console.log('Sending Email Admin Notification');
        res.render('transaction_email', {
            member: member,
            transaction : transaction
        }, function(err, html){
            helper.sendMail(
                null,
                'New bill payment has been made',
                html,
                null,
                function (status){
                }
            );
			next();
        });
    };

    var SendMemberNotification = function(next){
        console.log('Sending Email Member Notification');
        res.render('transaction_email', {
            member: member,
            transaction : transaction
        }, function(err, html){
            helper.sendMail(
                member.email,
                'New bill payment has been made',
                html,
                null,
                function (status) {
                }
            );
			next();
        });
    };

    populateMember(function(){
        validateBiller(function(){
            checkBalance(function(){
                deductBalance(function(){
                    saveTransaction(function(){
                        saveMember(function(){
                            new EmailAdminNotification(function(){
                                new SendMemberNotification(function(){

                                });
                            });
                            var promise = Transaction.populate(transaction, [{path:'paid_bill_to'}]);
                            promise.then(function(transaction){
                                var Memberbiller = mongoose.model('Memberbiller');
                                var promise = Memberbiller.populate(transaction.paid_bill_to,[{path:'member'},{path:'biller'}]);
                                promise.then(function(){
                                    helper.SendResponse(res, transaction, helper.TransactionResponse.TransactionSuccess);
                                });
                            }).end();
                        });
                    });
                });
            });
        });
    });
};

/**
 * WebService - PayLoan
 * @param req
 * @param res
 * @param app
 * @constructor
 */
exports.PayLoan = function(req, res, app){
    var member = req.member;
    var transaction = new Transaction(req.body.data);

    var populateMember = function(next){
        var Member = mongoose.model('Member');
        var promise = Member.populate(member,[{path:'microfinance'},{path:'loans_link'}]);
        promise.then(function(member){
            next();
        }).end();
    };

    var recomputeAmount = function(next){
        var loans = member.loans_link;
        var last_loan = loans[loans.length-1];
        console.log(last_loan);
        var r = parseFloat(last_loan.rate_per_period.value)/100;
        var PV = parseFloat(last_loan.present_value.value);
        var n = parseInt(last_loan.number_of_periods);

        var amount = (r*PV)/(1-Math.pow(1+r,(-1*n)));
        console.log('-----------------------------------');
        console.log(amount + ' ' + r + ' ' + PV + ' ' + n);
        console.log('-----------------------------------');
        transaction.amount = Math.ceil(amount);
        next();
    };

    var checkBalance = function(next){
        console.log('checking balance');
        if(member.getEwalletBalance()<transaction.amount.value){
            console.log('checking balance failed');
            helper.SendResponse(res, transaction, helper.TransactionResponse.TransactionInsuficientBalance);
        } else {
            console.log('checking balance succeeded');
            next();
        }
    };

    var deductBalance = function(next){
        console.log('deduct balance ');
        member.deductEwallet(transaction.amount.value);
        member.deductEwallet(member.microfinance.gochannel_fee.value);
        member.deductEwallet(member.microfinance.partner_fee.value);
        console.log('deduct balance succeeded');
        next();
    };

    var EWallet = function(next){
        if(transaction.payment_type==='E-Wallet'){
            transaction.status = 'Approve';
            checkBalance(function(){
                deductBalance(next);
            });
        } else {
            transaction.status = 'Pending';
            next();
        }
    };

    var saveTransaction = function(next){
        console.log('saving transaction');
        transaction.gochannel_fee = member.microfinance.gochannel_fee;
        transaction.partner_fee = member.microfinance.partner_fee;
        transaction.transaction_type = 'LOAN PAYMENT';
        transaction.member = member._id;
        transaction.member_name = member.first_name + ' ' + member.last_name;
        transaction.partner = member.microfinance._id;
        transaction.partner_name = member.microfinance.name;
        transaction.save(function(err){
            if(err){
                res.send(400, {
                    message : helper.getErrorMessage(err)
                });
            } else {
                console.log('saving transaction succeded');
                next();
            }
        });
    };

    var saveMember = function(next){
        console.log('saving member');
        member.transactions.push(transaction._id);
        member.isUpdated = [];
        member.save(function(err){
            if(err){
                res.send(400, {
                    message: helper.getErrorMessage(err)
                });
            } else {
                console.log('saving member succeded');
                next();
            }
        });
    };

    var SendAdminNotification = function(next){
        console.log('Sending Email Admin Notification');
        res.render('transaction_email', {
            sender: member,
            transaction : transaction
        }, function(err, html){
            helper.sendMail(
                null,
                'New bill payment has been made',
                html,
                null,
                function (status) {
                }
            );
			next();
        });
    };

    var SendMemberNotification = function(next){
        console.log('Sending Email Member Notification');
        res.render('transaction_email', {
            sender: member,
            transaction : transaction
        }, function(err, html){
            helper.sendMail(
                member.email,
                'New bill payment has been made',
                html,
                null,
                function (status) {
                }
            );
        });
        next();
    };

    populateMember(function(){
        recomputeAmount(function(){
            new EWallet(function(){
                saveTransaction(function(){
                    saveMember(function(){
                        new SendAdminNotification(function(){
                            new SendMemberNotification(function(){
                            });
                        });
                        helper.SendResponse(res, transaction, helper.TransactionResponse.TransactionSuccess);
                    });
                });
            });
        });
    });
};

/**
 * Transaction middleware
 */
exports.transactionByID = function(req, res, next, id) {
    Transaction.findById(id).populate('user', 'displayName').exec(function(err, transaction) {
		if (err) return next(err);
		if (! transaction) return next(new Error('Failed to load Transaction ' + id));
		req.transaction = transaction ;
		next();
	});
};


exports.loadOmniPay = function(req, res, next){
//    require('shelljs/global');
//    var path = require('path');
//    var file = path.resolve('./csv_omni_load/LOAD-09042014-001.csv');
//    if (exec('sh /root/sftppvb.sh '+file + ' LOAD-09042014-001.csv').code !== 0) {
//        res.jsonp({result:'ok'});
//    }
};

/**
 * Transaction authorization middleware
 */
exports.hasAuthorization = function(req, res, next) {
//	if (req.transaction.user.id !== req.user.id) {
//		return res.send(403, 'User is not authorized');
//	}
	next();
};