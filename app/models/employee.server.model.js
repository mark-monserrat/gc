'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    crypto = require('crypto');

/**
 * A Validation function for local strategy properties
 */
var validateLocalStrategyProperty = function(property) {
    return ((this.provider !== 'local' && !this.updated) || property.length);
};

/**
 * A Validation function for local strategy password
 */
var validateLocalStrategyPassword = function(password) {
    return (password && password.length >= 8);
};

/**
 * Employee Schema
 */
var EmployeeSchema = new Schema({
    first_name: {
        type: String,
        trim: true,
        default: '',
        required: 'Please fill in your first name'
    },
    last_name: {
        type: String,
        trim: true,
        default: '',
        required: 'Please fill in your last name'
    },
    email: {
        type: String,
        trim: true,
        default: '',
        match: [/.+\@.+\..+/, 'Please fill a valid email address'],
        index: {
            unique: true,
            dropDups: true
        },
        required: 'Please fill in your email'
    },
    password: {
        type: String,
        default: '',
        validate: [validateLocalStrategyPassword, 'Password should be longer'],
        required: 'Password is required'
    },
    salt: {
        type: String
    },
    contact_no: {
        type: String
    },
    address1: {
        type: String,
        required: 'Please fill in address 1'
    },
    address2: {
        type: String
    },
    city: {
        type: String,
        required:'Please fill in city'
    },
    country: {
        type: Schema.ObjectId,
        ref: 'Country',
        required: 'Please fill in country'
    },
    country_name: {
        type: String
    },
    zipcode: {
        type: String,
        required: 'Please fill in zip code'
    },
    employee_type:{
        type: Schema.ObjectId,
        ref: 'Employeetype'
    },
    employee_type_name:{
        type: String
    },
    date_created: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        required: 'Please fill in status'
    },
    user: {
        type: Schema.ObjectId,
        ref: 'Employee'
    },
    isAccountVirgin : {
        type: Boolean,
        default: true
    },
    role: [
        {
            type: Schema.ObjectId,
            ref: 'MyModule'
        }
    ],
    last_action : [
        {
            Title : {
                type: String
            },
            Url : {
                type: String
            }
        }
    ]
});

/**
 * Create instance method for hashing a password
 */
EmployeeSchema.methods.hashPassword = function(password) {
    if (this.salt && password) {
        return crypto.pbkdf2Sync(password, this.salt, 10000, 64).toString('base64');
    } else {
        return password;
    }
};

/**
 * Hook a pre save method to hash the password
 */
EmployeeSchema.pre('save', function(next) {
    if (this.password && this.password.length > 6) {
        this.salt = new Buffer(crypto.randomBytes(16).toString('base64'), 'base64');
        this.password = this.hashPassword(this.password);
    }
    next();
});

/**
 * Create instance method for authenticating user
 */
EmployeeSchema.methods.authenticate = function(password) {
    return this.password === this.hashPassword(password);
};

mongoose.model('Employee', EmployeeSchema);