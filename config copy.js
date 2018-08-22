// Server configuration

module.exports = {
	host: process.env.SERVER_HOST || 'localhost:3000',
	database: 'mongodb://localhost:27017',
	sessionSecret: process.env.SESSION_SECRET || 'PoKtSuRS2phosxZRV9XEVS9hVyMTzSyB',
	saltRounds: 10,
	mail: {
		smtpConfig: {
			host: 'smtp-mail.outlook.com',
			port: 587,
			auth: {
				user: 'upchievetest@hotmail.com',
				pass: '19970620david'
			},
			secure: false,
			requireTLS: true
		},
		senders: {
			noreply: 'upchievetest@hotmail.com'
		}
	},
	client: {
		host: 'localhost:8080'
	},
	socketsPort: 3001
};
