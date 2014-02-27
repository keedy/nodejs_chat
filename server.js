"use strict";

var config = require('./config'),
	express = require('express'),
	app = express(),
	server = require('http').createServer(app),
	io = require('socket.io').listen(server),
	connect = require('connect'),
	cookie = require('cookie'),
	ioSession = require('socket.io-session'),
	sessionStore = new connect.session.MemoryStore(),
	dataStore = require('./lib/datastore/redis').init(config.redis);

var sessionKey = '%56dA76ds^7Sfd^dsFD678%^&*';

// configure express
app.use(express.json());
app.use(express.urlencoded());
app.use(express.cookieParser(sessionKey));
app.use(express.session({secret: sessionKey, store: sessionStore, key: 'sid'}));

app.use(express.compress()); // gzip
app.use(express.static(__dirname + '/public'));
app.set('views', __dirname + '/views');
app.set('view engine', 'twig');

// configure socket.io
io.configure(function() {
	io.enable('browser client minification');
	io.enable('browser client gzip');
	// io.set('log level', config.server.log_level);
	io.set('log level', 2);
	io.set('transports', ['websocket', 'xhr-polling', 'jsonp-polling']);
});

app.get('/', function(req, res) {
	res.render('index.twig');
});

server.listen(config.server.port, config.server.host);

function join(room) {
	var userId = 1;
	var nickname = 'xxx';

	// redis.hset('user-data-' + nickname + '-' + room, 'nickname', nickname);
	// redis.hset('user-data-' + nickname + '-' + room, 'connectedAt', Date.now());
	// redis.hset('user-data-' + nickname + '-' + room, 'lastActivity', Date.now());
	dataStore.setUserData(userId, room, {nickname: nickname, connectedAt: Date.now(), lastActivity: Date.now()});

	dataStore.addUserToRoom(nickname, room);
	// redis.sadd('room-users-' + room, nickname);

	dataStore.addToRoomsList(room);
	// redis.sadd('room-list', room);

	dataStore.incrementRoomCounter(room);
	// redis.hincrby('room-data-' + room, 'counter', 1);

	dataStore.setRoomData(room, {name: room});
	// redis.hset('room-data-' + room, 'name', room);

	return true;
}

function leaveChatRoom(redis, nickname, room) {
	// redis.hdel('user-data-' + nickname + '-' + room, 'nickname');
	// redis.hdel('user-data-' + nickname + '-' + room, 'connectedAt');
	// redis.hdel('user-data-' + nickname + '-' + room, 'lastActivity');

	// redis.srem('room-users-' + room, nickname);
	// redis.hincrby('room-data-' + room, 'counter', -1);
}

// function getRoomsList(redis, callback) {
// 	redis.smembers('room-list', function(err, rooms) {
// 		var roomsList = [];
// 		var i = 0;
// 		var numCompleted = 0;

// 		var markAsCompleted = function() {
// 			numCompleted++;

// 			if(numCompleted === rooms.length) {
// 				callback(roomsList);
// 			}
// 		};

// 		if(!rooms || rooms.length === 0) {
// 			callback([]);
// 		}
// 		else {
// 			var roomCallback = function(err, roomData) {
// 				roomsList.push({
// 					'name': roomData.name,
// 					'counter': roomData.counter
// 				});
// 				markAsCompleted();
// 			};

// 			for(i = 0; i < rooms.length; ++i) {
// 				var room = rooms[i];
// 				redis.hgetall('room-data-' + room, roomCallback);
// 			}
// 		}
// 	});
// }

function authorize(req, accept) {
	if(!req.headers.cookie) {
		return accept('Session cookie required', false);
	}

	req.cookie = cookie.parse(decodeURIComponent(req.headers.cookie));
	req.cookie = connect.utils.parseSignedCookies(req.cookie, sessionKey);
	// console.log('Cookie: ' + JSON.stringify(req.cookie));

	req.sessionID = req.cookie['sid'];
	
	sessionStore.get(req.sessionID, function(err, session){
		if (err) {
			return accept('Error in session store.', false);
		}
		else if (!session) {
			return accept('Session not found.', false);
		}

		req.session = session;
		return accept(null, true);
	});
}

io.set('authorization', ioSession(express.cookieParser(sessionKey), sessionStore, 'sid', authorize));

io.sockets.on('connection', function(socket) {
	var session = socket.handshake.session;

	socket.emit('config', config.chat);

	socket.on('setNickname', function(nickname) {
		socket.set('nickname', nickname);
		// console.log('session before: ' + JSON.stringify(session));
		session.nickname = nickname;
		// console.log('session after: ' + JSON.stringify(session));
	});

	socket.on('setAccessLevel', function(accessLevel) {
		socket.set('accessLevel', accessLevel);
		session.accessLevel = accessLevel;
	});

	socket.on('getAccessLevel', function() {
		socket.get('accessLevel', function(accessLevel) {
			socket.emit('accessLevel', accessLevel);
		});
	});

	socket.on('join', function(room) {
		socket.set('room', room);
		socket.get('nickname', function(err, nickname) {
			join(room);

			dataStore.getUsersList(room, function(users) {
				io.sockets.emit('usersList', users);
			});

			dataStore.getRoomsList(function(rooms) {
				io.sockets.emit('roomsList', rooms);
			});

			// getRoomsList(dataStore, function(rooms) {
			// 	io.sockets.emit('roomsList', rooms);
			// });
		});
	});

	socket.on('message', function(message) {
		socket.get('nickname', function(error, nickname) {
			socket.get('room', function(error, room) {
				var data = {'message' : message, 'nickname' : nickname, 'room': room};
				socket.broadcast.emit('message', data);
			});
		});
	});

	socket.on('logout', function() {
		socket.get('nickname', function(error, nickname) {
			socket.get('room', function(error, room) {
				leaveChatRoom(dataStore, nickname, room);
				// getUsersList(dataStore, room, function(users) {
				// 	socket.broadcast.emit('usersList', users);
				// });

				// getRoomsList(dataStore, function(rooms) {
				// 	socket.broadcast.emit('roomsList', rooms);
				// });
				socket.set('accessLevel', 0);
			});
		});
	});
});
