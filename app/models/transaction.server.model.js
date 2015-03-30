'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

require('mongoose-double')(mongoose);
var SchemaTypes = mongoose.Schema.Types;

/**
 * Transaction Schema
 */
var TransactionSchema = new Schema({
	date_created: {
		type: Date,
		default: Date.now
	},
	date_updated: {
		type: Date,
		default: Date.now
	},
	transaction_type: {
		type: String,
		trim: true
	},
	member: {
		type: Schema.ObjectId,
        ref: 'Member',
        required: 'Member is required'
	},
    member_name: {
        type: String
    },
	remitted_to: {
		type: Schema.ObjectId,
        ref: 'Beneficiary'
	},
	remitted_to_contact: {
		type: Schema.ObjectId,
        ref: 'Member'
	},
    recipient_type: {
        type: String
    },
    remitted_to_name: {
        type: String
    },
	paid_loan_to: {
		type: Schema.ObjectId,
        ref: 'Partner'
	},
    paid_loan_to_name: {
        type: String
    },
	paid_bill_to: {
		type: Schema.ObjectId,
        ref: 'Memberbiller'
	},
    paid_bill_to_name: {
        type: String
    },
	amount: {
		type: SchemaTypes.Double
	},
	pre_balance: {
		type: SchemaTypes.Double
	},
	post_balance: {
		type: SchemaTypes.Double
	},
	partner_fee: {
		type: SchemaTypes.Double
	},
	gochannel_fee: {
		type: SchemaTypes.Double
	},
	payout_method:  {
        type: Schema.ObjectId,
        ref: 'PayoutMethod'
    },
    payout_method_name: {
        type: String
    },
    payment_type:  {
        type: String
    },
	account_number: {
		type: String
	},
	account_name: {
		type: String
	},
	reference_no: {
		type: String
	},
    bank_name: {
        type: String
    },
    deposit_date: {
        type: Date
    },
    slip_refno: {
        type: String
    },
	slip_img: {
		type: String
	},
	status: {
		type: String,
		default:'PENDING'
	},
    partner: {
        type: Schema.ObjectId,
        ref: 'Partner'
    },
    partner_name: {
        type: String
    },
    CardNbr: {
        type: String
    }
});

/**
 * Generate Reference Number
 */
TransactionSchema.pre('save', function(next) {
    var type = '';
    if (!this.reference_no) {
        switch(this.transaction_type){
            case 'CARD-TOPUP':
                type = 'CTU-';
                break;
            case 'TOPUP':
                type = 'TU-';
                break;
            case 'REMITTANCE':
                type = 'RM-';
                break;
            case 'BILLS PAYMENT':
                type = 'BP-';
                break;
            case 'LOAN PAYMENT':
                type = 'LP-';
                break;
        }
        this.reference_no = type+Math.floor((Math.random()*999999999)+1);
    }

    next();
});

mongoose.model('Transaction', TransactionSchema);