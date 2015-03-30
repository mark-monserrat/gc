'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

/**
 * AuditTrails Schema
 */
var AuditTrailsSchema = new Schema({
	date_created: {
        type: Date,
        default: Date.now
    },
    tablename: {
        type: String
    },
    user: {
        type: Schema.ObjectId,
        ref: 'Employee'
    },
    record_id: {
        type: Schema.ObjectId
    },
    changes: [
        {
            field: String,
            from: String,
            to: String
        }
    ]
});

mongoose.model('AuditTrails', AuditTrailsSchema);