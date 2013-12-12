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
	defaults: {
		main_room_name: 'chat'
	},
	events: {
		user_join: {
			enabled: true,
			message: 'User %nickname% joined'
		},
		user_leave: {
			enabled: true,
			message: 'User %nickname% leave'
		},
		topic_changed: {
			enabled: true,
			message: 'Topic was changed from %old_topic% to %new_topic%'
		},
		new_public_message: {
			play_sound: true,
			sound_file: '/beep.mp3',
			show_in_title: true
		},
		new_private_message: {
			play_sound: true,
			sound_file: '/beep.mp3',
			show_in_title: true
		}
	},
	behaviors: {
		user_writing_message: {
			display_icon: true,
			icon_file: '/writing_icon.gif',
			display_text: false,
			text_message: 'is writing...'
		}
	},
	appearance: {
		display_emoticons: true,
		emoticons_filename: 'default.png'
	},
	security: {
		flood: {
			prevent: true,
			max_messages_per_second: 3,
			first_warning: 'kick',
			second_warning: 'temp_ban',
			third_warning: 'perm_ban',
		},
		spam: {
			block_links: true,
			block_emails: true,
			first_warning: 'kick',
			second_warning: 'temp_ban',
			third_warning: 'perm_ban',
		},
		censorship: {
			enabled: true,
			forbidden_words: [ // polish examples
				'^(kurw|kurew|wkurw|wykurw|skurw|podkurw|zakurw|nakurw).*$',
				'^(chuj).*$',
				'^(spierd).*$',
				'^(pierdol|wypierdo|wypierda|spierd|podpierdo|podpierda|zapierdo|zapierda|upierdo|upierda).*$',
				'^(jebać|jebaj|jeban|wyjeba).*$',
				'^(zapierdol).*$',
				'^(wypierdol).*$',
				'^(podpierdol).*$',
				'^(cipa|cipy|cipie|cipy|cipą|cipie|cipo|cipach|)$',
				'^(cipk).*$',
				'^(sukins).*$',
				'^(pizd).*$',
				'^(ciul).*$'
			],
			first_warning: 'kick',
			second_warning: 'temp_ban',
			third_warning: 'perm_ban',
		},
		admins: ['keedy', 'keedy2']
	}
};