'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

/**
 * Biller Schema
 */
var BillerSchema = new Schema({
	name: {
		type: String,
		trim: true,
		default: '',
		required: 'Please fill in biller name'
	},
    is_active: {
        type: Boolean,
        default: 'Active'
    },
    partner:{
        type: Schema.ObjectId,
        ref: 'Partner',
        required:'Partner is required'
    }
});

mongoose.model('Biller', BillerSchema);