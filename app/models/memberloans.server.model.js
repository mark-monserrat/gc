'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;
require('mongoose-double')(mongoose);
var SchemaTypes = mongoose.Schema.Types;
/**
 * Memberloans Schema
 */
var MemberloansSchema = new Schema({
	member : {
        type : Schema.ObjectId,
        ref : 'member'
    },
    member_name: {
        type: String
    },
    reference_no: {
        type : String,
        required : 'Reference number is required'
    },
    original_value : {
        type : SchemaTypes.Double,
        required: 'Loan original value is required'
    },
    present_value : {
        type : SchemaTypes.Double,
        required: 'Loan present value is required'
    },
    rate_per_period : {
        type : SchemaTypes.Double,
        required : 'Rate per period is required'
    },
    number_of_periods : {
        type : Number,
        required: 'Number of periods is required'
    },
    current_period : {
        type : Number,
        default : 1
    },
    status : {
        type : String,
        default : 'Inactive'
    }
});

mongoose.model('Memberloans', MemberloansSchema);