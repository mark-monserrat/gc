'use strict';

module.exports = {
	db: 'mongodb://localhost/gochannelv10-dev',
	app: {
		title: 'KineoV1.0 - Development Environment'
	},
    port: 81,
    kyc_email: 'admin@codehood.biz',
    noreply_email : 'noreply@codehood.biz',
    email_server : 'mail.codehood.biz',
    email_port : 465,
    email_username : 'noreply@codehood.biz',
    email_password : 'q1w2e3r4',
    gochannel_admin : [
        'admin@codehood.biz',
        'jasonvillalon@gmail.com'
    ],
	facebook: {
		clientID: process.env.FACEBOOK_ID || 'APP_ID',
		clientSecret: process.env.FACEBOOK_SECRET || 'APP_SECRET',
		callbackURL: 'http://localhost:3000/auth/facebook/callback'
	},
	twitter: {
		clientID: process.env.TWITTER_KEY || 'CONSUMER_KEY',
		clientSecret: process.env.TWITTER_SECRET || 'CONSUMER_SECRET',
		callbackURL: 'http://localhost:3000/auth/twitter/callback'
	},
	google: {
		clientID: process.env.GOOGLE_ID || 'APP_ID',
		clientSecret: process.env.GOOGLE_SECRET || 'APP_SECRET',
		callbackURL: 'http://localhost:3000/auth/google/callback'
	},
	linkedin: {
		clientID: process.env.LINKEDIN_ID || 'APP_ID',
		clientSecret: process.env.LINKEDIN_SECRET || 'APP_SECRET',
		callbackURL: 'http://localhost:3000/auth/linkedin/callback'
	}
};