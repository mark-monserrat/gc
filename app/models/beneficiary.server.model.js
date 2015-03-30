'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

/**
 * Beneficiary Schema
 */
var BeneficiarySchema = new Schema({
	first_name: {
		type: String,
		trim: true,
		default: '',
		required: 'Please fill in your first name'
	},
	last_name: {
		type: String,
		trim: true,
		default: '',
		required: 'Please fill in your last name'
	},
	middle_name: {
		type: String,
		trim: true
	},
	email: {
		type: String,
		trim: true,
		default: '',
		required: 'Please fill in your email',
		match: [/.+\@.+\..+/, 'Please fill a valid email address']
	},
	contact_no: {
		type: String
	},
	address1: {
		type: String,
        required: 'Address 1 is required'
	},
	address2: {
		type: String
	},
	city: {
		type: String,
        required: 'City is required'
	},
	country: {
		type: Schema.ObjectId,
        ref: 'Country',
        required: 'Country is required'
	},
    country_name: {
       type: String
    },
	zipcode: {
		type: String
	},
	date_created: {
		type: Date,
		default: Date.now
	},
	member: {
		type: Schema.ObjectId,
        ref: 'Member',
        required: 'Member is required'
	},
    member_name: {
        type: String
    },
	status: {
		type: String,
		default:'Pending',
        required: 'Status is required'
	},
	bank_name: {
		type: String,
        required: 'Bank is required'
	},
	account_number: {
		type: String,
        required: 'Account Number is required'
	},
    ewallet_accountnumber: {
		type: String,
        required: 'EWallet Account Number is required'
	}
});

mongoose.model('Beneficiary', BeneficiarySchema);