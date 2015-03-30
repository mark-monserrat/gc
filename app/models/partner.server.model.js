'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

require('mongoose-double')(mongoose);
var SchemaTypes = mongoose.Schema.Types;

/**
 * A Validation function for local strategy password
 */
var validateLocalStrategyPassword = function(password) {
	return (this.provider !== 'local' || (password && password.length > 6));
};
/**
 * Partner Schema
 */
var PartnerSchema = new Schema({
	name: {
		type: String,
		trim: true,
		default: '',
		required: 'Please fill in partner name'
	},
	partner_type: {
		type: String,
		trim: true,
		default: '',
		required: 'Please fill in partner type'
	},
	email: {
		type: String,
		trim: true,
		default: '',
		required: 'Please fill in your email',
		match: [/.+\@.+\..+/, 'Please fill a valid email address']
	},
	password: {
		type: String,
		default: '',
		validate: [validateLocalStrategyPassword, 'Password should be longer']
	},
	salt: {
		type: String
	},
	phone: {
		type: String,
        required: 'Phone is required'
	},
    fax: {
        type: String
    },
    mobile: {
        type: String
    },
    notes: {
        type: String
    },
	address1: {
		type: String,
        required: 'Address 1 is required'
	},
	address2: {
		type: String
	},
	city: {
		type: String,
        required: 'City is required'
	},
	country: {
		type: Schema.ObjectId,
        ref: 'Country',
        required: 'Country is required'
	},
    country_name: {
        type: String
    },
	zipcode: {
		type: String,
        required: 'Zip Code is required'
	},
	date_created: {
		type: Date,
		default: Date.now
	},
	status: {
		type: String,
		default:'Active',
        required: 'Status is required'
	},
    gochannel_fee: {
        type: SchemaTypes.Double
    },
    partner_fee: {
        type: SchemaTypes.Double
    },
	biller_link: [
        {
                type: Schema.ObjectId,
                ref: 'Biller'
        }
    ],
	remittance_service: [
        {
            remittance: {
                type: Schema.ObjectId,
                ref: 'Services'
            },
            is_active: {
                type: String
            }
        }
    ],
	microfinance_service: [
        {
            microfinance: {
                type: Schema.ObjectId,
                ref: 'Services'
            },
            is_active: {
                type: String
            }
        }
    ],
	billspayment_service: [
        {
            billspayement: {
                type: Schema.ObjectId,
                ref: 'Services'
            },
            is_active: {
                type: String
            }
        }
    ],
	payout_method: [
        {
            type: Schema.ObjectId,
            ref: 'PayoutMethod'
        }
    ]
});

mongoose.model('Partner', PartnerSchema);