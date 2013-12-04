module.exports = {
	ip: process.env.APP_IP || '0.0.0.0',
	port: parseInt(process.env.APP_PORT || '8000'),
	messageId: 'chat-message',
	history: 'chat-history',
	users: 'chat-users',
	session: 'chat-session',
}
