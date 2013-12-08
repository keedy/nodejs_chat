exports.server = {
	host: process.env.APP_IP || '0.0.0.0',
	port: parseInt(process.env.APP_PORT || '8000')
};

exports.redis = {
	host: process.env.REDIS_HOST || 'localhost',
	port: parseInt(process.env.REDIS_PORT || '6379'),
	password: process.env.REDIS_PASSWORD || undefined,
	log_level: parseInt(process.env.REDIS_LOG_LEVEL || '3')
};

exports.chat = {
	user_join_message: 'User %nickname$ joined',
	user_leave_message: 'User %nickname% has left',

	writing_icon_enabled: false,

	display_emoticons: true,
	emoticons_filename: 'default.png',

	anti_flood_protection: true,
	anti_spam_protection: true,

	admin_list: {
		nickname: 'keedy',
		nickname: 'keedy2'
	}
}