'use strict';

/**
 * Module dependencies.
 */
var should = require('should'),
	mongoose = require('mongoose'),
	User = mongoose.model('User'),
	PayoutMethod = mongoose.model('PayoutMethod');

/**
 * Globals
 */
var user, payoutMethod;

/**
 * Unit tests
 */
describe('Payout method Model Unit Tests:', function() {
	beforeEach(function(done) {
		user = new User({
			firstName: 'Full',
			lastName: 'Name',
			displayName: 'Full Name',
			email: 'test@test.com',
			username: 'username',
			password: 'password'
		});

		user.save(function() { 
			payoutMethod = new PayoutMethod({
				// Add model fields
				// ...
			});

			done();
		});
	});

	describe('Method Save', function() {
		it('should be able to save without problems', function(done) {
			return payoutMethod.save(function(err) {
				should.not.exist(err);
				done();
			});
		});
	});

	afterEach(function(done) { 
		PayoutMethod.remove().exec();
		User.remove().exec();

		done();
	});
});