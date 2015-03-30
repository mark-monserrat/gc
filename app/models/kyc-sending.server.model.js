'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

/**
 * KycSending Schema
 */
var KycSendingSchema = new Schema({
    batch_number: {
        type: String
    },
	status: {
        type: String
    },
    members: [
        {
            type: Schema.ObjectId,
            ref: 'Member'
        }
    ],
    path: {
        type: String
    },
    file_name: {
        type: String
    },
    date_created: {
        type: Date,
        default: Date.now
    }
});

mongoose.model('KycSending', KycSendingSchema);