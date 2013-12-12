"use strict";

var config = require('./config'),
	express = require('express'),
	app = express(),
	server = require('http').createServer(app),
	io = require('socket.io').listen(server),
	redis = require('redis'),
	datastore = redis.createClient(config.redis.port, config.redis.host);

// configure express
app.use(express.compress()); // gzip
app.set('views', __dirname + '/views');
app.set('view engine', 'twig');
app.configure(function() {
   app.use(express.static(__dirname + '/public'));
});

// configure socket.io
io.configure(function () {
	io.enable('browser client minification');
	io.enable('browser client gzip');
	io.set('log level', config.redis.log_level);
	io.set('transports', [
		'websocket',
		'xhr-polling',
		'jsonp-polling'
	]);
});

app.get('/', function(req, res) {
	res.render('index.twig');
});

server.listen(config.server.port, config.server.host);

if(config.redis.password) {
	datastore.auth(config.redis.password);
}

datastore.on('error', function(err) {
	console.log('Redis error: ' + err);
});

function joinChatRoom(redis, nickname, roomName) {
	redis.hset('user-data-' + nickname + '-' + roomName, 'nickname', nickname);
	redis.hset('user-data-' + nickname + '-' + roomName, 'connectedAt', Date.now());
	redis.hset('user-data-' + nickname + '-' + roomName, 'lastActivity', Date.now());

	redis.sadd('room-users-' + roomName, nickname);
	redis.sadd('room-list', roomName);
	redis.hincrby('room-data-' + roomName, 'counter', 1);
	redis.hset('room-data-' + roomName, 'name', roomName);
}

function leaveChatRoom(redis, nickname, roomName) {
	redis.hdel('user-data-' + nickname + '-' + roomName, 'nickname');
	redis.hdel('user-data-' + nickname + '-' + roomName, 'connectedAt');
	redis.hdel('user-data-' + nickname + '-' + roomName, 'lastActivity');

	redis.srem('room-users-' + roomName, nickname);
	redis.hincrby('room-data-' + roomName, 'counter', -1);
}

function getUsersList(redis, roomName, callback) {
	redis.smembers('room-users-' + roomName, function(err, members) {
		var users = [];
		var i = 0;
		var numCompleted = 0;

		var markAsCompleted = function() {
			numCompleted++;

			if(numCompleted === members.length) {
				callback(users);
			}
		};

		if(!members || members.length === 0) {
			callback([]);
		}
		else {
			var userCallback = function(err, userData) {
				users.push({
					'nickname': userData.nickname,
					'connectedAt': userData.connectedAt
				});
				markAsCompleted();
			};
			for(i = 0; i < members.length; ++i) {
				var userID = members[i];
				redis.hgetall('user-data-' + userID + '-' + roomName, userCallback);
			}
		}
	});
}

function getRoomsList(redis, callback) {
	redis.smembers('room-list', function(err, rooms) {
		var roomsList = [];
		var i = 0;
		var numCompleted = 0;

		var markAsCompleted = function() {
			numCompleted++;

			if(numCompleted === rooms.length) {
				callback(roomsList);
			}
		};

		if(!rooms || rooms.length === 0) {
			callback([]);
		}
		else {
			var roomCallback = function(err, roomData) {
				roomsList.push({
					'name': roomData.name,
					'counter': roomData.counter
				});
				markAsCompleted();
			};
			for(i = 0; i < rooms.length; ++i) {
				var roomName = rooms[i];
				redis.hgetall('room-data-' + roomName, roomCallback);
			}
		}
	});
}

io.sockets.on('connection', function(socket) {
	socket.emit('config', config.chat);

	socket.on('setNickname', function(nickname) {
		socket.set('nickname', nickname);
	});

	socket.on('setAccessLevel', function(accessLevel) {
		socket.set('accessLevel', accessLevel);
	});

	socket.on('getAccessLevel', function() {
		socket.get('accessLevel', function(accessLevel) {
			socket.emit('accessLevel', accessLevel);
		});
	});

	socket.on('join', function(room) {
		socket.set('room', room);
		socket.get('nickname', function(err, nickname) {
			joinChatRoom(datastore, nickname, room);
			getUsersList(datastore, room, function(users) {
				io.sockets.emit('usersList', users);
			});

			getRoomsList(datastore, function(rooms) {
				io.sockets.emit('roomsList', rooms);
			});
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
				leaveChatRoom(datastore, nickname, room);
				getUsersList(datastore, room, function(users) {
					socket.broadcast.emit('usersList', users);
				});

				getRoomsList(datastore, function(rooms) {
					socket.broadcast.emit('roomsList', rooms);
				});
				socket.set('accessLevel', 0);
			});
		});
	});
});
