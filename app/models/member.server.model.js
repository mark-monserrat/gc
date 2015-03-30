'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
    crypto = require('crypto');
require('mongoose-double')(mongoose);
var SchemaTypes = mongoose.Schema.Types;

/**
 * A Validation function for local strategy password
 */
var validateLocalStrategyPassword = function(password) {
    return (password && password.length > 6);
};

/**
 * Member Schema
 */
var MemberSchema = new Schema({
    status: {
        type: String,
        required: 'Status is required'
    },
    microfinance: {
        type: Schema.ObjectId,
        ref: 'Partner',
        required: 'Please select your microfinance partner'
    },
    remittance: {
        type: Schema.ObjectId,
        ref: 'Partner'
    },
    card_issuer: {
        type: String
    },
    CardNbr: {
        type: String
    },
    date_joined: {
        type: Date,
        required: 'Please fill in date joined'
    },
    last_name: {
        type: String,
        trim: true,
        default: '',
        required: 'Please fill in your last name'
    },
    first_name: {
		type: String,
		trim: true,
		default: '',
		required: 'Please fill in your first name'
	},
	middle_name: {
		type: String,
		trim: true
	},
    name_on_card: {
        type: String,
        trim: true,
        required: 'Please fill in name on card'
    },
    title: {
        type: String,
        required: 'Please fill in title'
    },
    civil_status: {
        type: String,
        required: 'Please fill in civil status'
    },
    birthday: {
        type: Date,
        required: 'Please fill in birthday'
    },
    birthplace: {
        type: String,
        required: 'Please fill in birth place'
    },
    citizenship: {
        type: String,
        required: 'Please fill in citizenship'
    },
    phone1: {
        type: String,
        required: 'Please fill in Phone (landline)'
    },
    mobile: {
        type: String,
        required: 'Please fill in Mobile'
    },
	email: {
		type: String,
		trim: true,
		default: '',
        required: 'Please fill in your email',
		match: [/.+\@.+\..+/, 'Please fill a valid email address'],
        index: {
            unique: true,
            dropDups: true
        }
	},
    address_type:{
        type: String,
        required: 'Please select address type'
    },
    address1: {
        type: String,
        required: 'Address 1 is required'
    },
    address2: {
        type: String
    },
    provincial_code: {
        type: String,
        required: 'Please fill in provincial code'
    },
    zipcode: {
        type: String,
        required: 'Zip Code is required'
    },
    country: {
        type: Schema.ObjectId,
        ref: 'Country',
        required: 'Country is required'
    },
    country_name: {
        type: String
    },
    is_mailing_address: {
        type: Boolean
    },
    company_name: {
        type: String
    },
    work_title: {
        type: String
    },
    name_of_supervisor: {
        type: String
    },
    company_address1: {
        type: String
    },
    company_address2: {
        type: String
    },
    company_zipcode: {
        type: String
    },
    company_country: {
        type: Schema.ObjectId,
        ref: 'Country'
    },
    company_country_name: {
        type: String
    },
    company_phone1: {
        type: String
    },
    estimated_salary: {
        type: String
    },
    year_employed: {
        type: String
    },
    years_worked: {
        type: String
    },
    mothers_first_name: {
        type: String,
        required: 'Please fill in mothers first name'
    },
    mothers_maiden_surname: {
        type: String,
        required: 'Please fill in mothers surname'
    },
    fathers_first_name: {
        type: String,
        required: 'Please fill in fathers first name'
    },
    fathers_surname: {
        type: String,
        required: 'Please fill in fathers surname'
    },
    mothers_birthday: {
        type: Date
    },
    sss_id_number: {
        type: String
    },
    sss_id_issuance_date: {
        type: String
    },
    driverslicenseid: {
        type: String
    },
    drivers_license_issuance_date: {
        type: String
    },
    driverslicenseexpirydate: {
        type: String
    },
    passportid: {
        type: String
    },
    passport_issuance_date: {
        type: String
    },
    passportexpirydate: {
        type: String
    },
	password: {
		type: String,
		default: '',
		validate: [validateLocalStrategyPassword, 'Password should be longer']
	},
	salt: {
		type: String
	},
	ewallet_balance: {
		type: SchemaTypes.Double,
        default: 0
	},
	biller_link: [
        {
            type: Schema.ObjectId,
            ref: 'Memberbiller'
        }
    ],
	remittance_name: {
       type: String
    },
    microfinance_name: {
        type: String
    },
	transactions: [
        {
            type: Schema.ObjectId,
            ref: 'Transaction'
        }
    ],
	contact_no: {
		type: String
	},
	date_created: {
		type: Date,
		default: Date.now
	},
	beneficiaries_link: [
        {
			type: Schema.ObjectId,
			ref: 'Beneficiary'
        }
    ],
	contacts_link: [
        {
			type: Schema.ObjectId,
			ref: 'Member'
        }
    ],
    contacts_status: [
        {
            member_id: {
                type: Schema.ObjectId,
                ref: 'Member'
            },
            status: {
                type: String,
                default: 'Pending'
            }
        }
    ],
    loans_link : [
        {
            type : Schema.ObjectId,
            ref : 'Memberloans'
        }
    ],
    isUpdated: [{
        type: String
    }],
    isAccountVirgin: {
        type: Boolean,
        default: true
    },
    ProfilePic: {
        type: String
    },
    KYCStatus: {
        type: String,
        default: 'Pending'
    },
    Gender: {
        type: String
    },
    remittance_received: [{
        type: Schema.ObjectId,
        ref: 'Transaction'
    }]
});

/**
 * Create instance method for hashing a password
 */
MemberSchema.methods.hashPassword = function(password) {
    if (this.salt && password) {
        return crypto.pbkdf2Sync(password, this.salt, 10000, 64).toString('base64');
    } else {
        return password;
    }
};

/**
 * Hook a pre save method to hash the password
 */
MemberSchema.pre('save', function(next) {
    if (this.password && this.password.length > 6) {
        this.salt = new Buffer(crypto.randomBytes(16).toString('base64'), 'base64');
        this.password = this.hashPassword(this.password);
    }
    next();
});

/**
 * Create instance method for authenticating user
 */
MemberSchema.methods.authenticate = function(password) {
    console.log(this.password);
    console.log(this.hashPassword(password));
    return this.password === this.hashPassword(password);
};

MemberSchema.methods.getEwalletBalance = function(){
    var balance = this.ewallet_balance.value;
    if(balance){
        return balance;
    } else {
        return 0;
    }
};

MemberSchema.methods.deductEwallet = function(amount){
    var balance = this.ewallet_balance.value;
    if(balance){
        this.ewallet_balance -= parseFloat(amount);
    }
};

MemberSchema.methods.addEwallet = function(amount){
    var balance = this.ewallet_balance.value;
    if(balance){
        this.ewallet_balance = parseFloat(balance)+parseFloat(amount);
    } else {
        this.ewallet_balance = amount;
    }
};

mongoose.model('Member', MemberSchema);