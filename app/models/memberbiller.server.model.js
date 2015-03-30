'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

/**
 * Memberbiller Schema
 */
var MemberbillerSchema = new Schema({
    account_number:{
        type: String,
        required: 'Account number is required'
    },
    account_name:{
        type: String,
        required: 'Account name is required'
    },
    member:{
        type: Schema.ObjectId,
        ref: 'Member',
        required: 'Member is required'
    },
    member_name:{
        type: String
    },
    biller:{
        type: Schema.ObjectId,
        ref: 'Biller',
        required: 'Biller is required'
    },
    biller_name:{
        type: String
    },
    status: {
        type: String,
        default: 'Pending',
        required: 'Status is required'
    },
    date_created: {
        type: Date,
        default: Date.now
    }
});

mongoose.model('Memberbiller', MemberbillerSchema);