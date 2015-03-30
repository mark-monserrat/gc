'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

/**
 * Module Schema
 */
var ModuleSchema = new Schema({
    en_us: {
        type: String
    },
    ch_hk: {
        type: String
    },
    priv_id:{
        type: String,
        index: {
            unique: true,
            dropDups: true
        }
    },
    checked : {
        type : Boolean
    },
    parent: {
        type : Schema.ObjectId,
        ref : 'MyModule'
    }
});

mongoose.model('MyModule', ModuleSchema);