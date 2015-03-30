'use strict';

/**
 * Module dependencies.
 */
var passport = require('passport');

module.exports = function(app) {
    var members = require('../../app/controllers/members');
    var beneficiaries = require('../../app/controllers/beneficiaries');
    var transactions = require('../../app/controllers/transactions');
    var membersbiller = require('../../app/controllers/membersbiller');

    app.route('/api/members/auth/login')
        .post(members.signin);

    app.route('/api/members/update_data')
        .post(members.requiresLogin, members.update_data);

    app.route('/api/transactions/sendmoney/:memberId')
        .post(members.requiresLogin, function(req, res){
            transactions.sendMoney(req, res, app);
        });
    app.route('/api/transactions/PayBills/:memberId')
        .post(members.requiresLogin, function(req, res){
            transactions.PayBills(req, res, app);
        });
    app.route('/api/transactions/PayLoan/:memberId')
        .post(members.requiresLogin, function(req, res){
            transactions.PayLoan(req, res, app);
        });
    app.route('/api/transactions/topup/:memberId')
        .post(members.requiresLogin, function(req, res){
            transactions.TopUp(req, res, app);
        });
    app.route('/api/member/AddBeneficiary/:memberId')
        .post(members.requiresLogin, function(req, res){
            beneficiaries.AddBeneficiary(req, res, app);
        });
    app.route('/api/member/AddContact/:memberId')
        .post(members.requiresLogin, function(req, res){
            members.AddContact(req, res, app);
        });
    app.route('/api/member/RequestAction/:memberId')
        .post(members.requiresLogin, function(req, res){
            members.RequestAction(req, res, app);
        });
    app.route('/api/member/AddMemberBiller/:memberId')
        .post(members.requiresLogin, function(req, res){
            membersbiller.AddMemberBiller(req, res, app);
        });

    app.route('/api/member/changepw/:memberId')
        .post(members.requiresLogin, function(req, res){
            members.changePassword(req, res, app);
        });

    app.route('/api/member/changeprofilepic/:memberId')
        .post(members.requiresLogin, members.changeProfilePic);

    // Finish by binding the Member middleware
    app.param('memberId', members.memberByID);
};