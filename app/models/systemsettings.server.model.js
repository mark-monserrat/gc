'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

/**
 * Systemsettings Schema
 */
var SystemsettingsSchema = new Schema({
	name: {
        type: String,
        index: {
            unique: true,
            dropDups: true
        }
    },
    value: {
        type: String
    }
});

mongoose.model('Systemsettings', SystemsettingsSchema);