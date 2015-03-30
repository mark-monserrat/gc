'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

/**
 * Notification Schema
 */
var NotificationSchema = new Schema({
	message: {
		type: String,
		trim: true,
	},
	type: {
		type: String,
		trim: true
	},
	date: {
		type: Number,
		default: Date.now
	},
	notif_to: {
		type: Schema.ObjectId,
		ref: 'Members'
	},
	category: {
		type: String,
		trim: true
	}
});

mongoose.model('Notification', NotificationSchema);