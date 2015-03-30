'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

/**
 * Employeetype Schema
 */
var EmployeetypeSchema = new Schema({
	name: {
		type: String,
		default: '',
		required: 'Please fill Employeetype name',
		trim: true,
        index: {
            unique: true,
            dropDups: true
        }
	},
    privileges : [{
        type: Schema.ObjectId,
        ref: 'MyModule',
        required: 'Please add privileges'
    }],
	created: {
		type: Date,
		default: Date.now
	},
});

mongoose.model('Employeetype', EmployeetypeSchema);