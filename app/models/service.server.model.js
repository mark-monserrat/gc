'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

require('mongoose-double')(mongoose);
var SchemaTypes = mongoose.Schema.Types;

/**
 * Service Schema
 */
var ServiceSchema = new Schema({
	name: {
		type: String,
		trim: true,
		default: '',
		required: 'Please fill in service name'
	},
	type: {
		type: String,
		trim: true,
		default: '',
		required: 'Please fill in service type'
	},
	rate: {
		type: SchemaTypes.Double,
		trim: true,
		default: '',
		required: 'Please fill in service rate'
	},
	is_active: {
		type: Boolean,
		trim: true,
		default: 'true'
	}
	
});

mongoose.model('Service', ServiceSchema);