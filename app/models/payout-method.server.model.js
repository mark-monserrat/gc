'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

require('mongoose-double')(mongoose);
var SchemaTypes = mongoose.Schema.Types;

/**
 * PayoutMethod Schema
 */
var PayoutMethodSchema = new Schema({
    name : {
        type: String,
        required: 'Name is required'
    },
    gochannel_fee: {
        type: SchemaTypes.Double,
        required: 'Codehood Fee is required'
    },
    partner_fee: {
        type: SchemaTypes.Double,
        required: 'Partner fee is required'
    }
});

mongoose.model('PayoutMethod', PayoutMethodSchema);