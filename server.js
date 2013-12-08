"use strict";

var config = require('./config'),
	express = require('express'),
	app = express(),
	server = require('http').createServer(app),
	io = require('socket.io').listen(server),
	redis = require('redis'),
	datastore = redis.createClient(config.redis.port, config.redis.host);

// configure express
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

function addUserToList(redis, nickname, room) {
	redis.hset('user-data-' + nickname + '-' + room, 'nickname', nickname);
	redis.hset('user-data-' + nickname + '-' + room, 'connectedAt', Date.now());
	redis.hset('user-data-' + nickname + '-' + room, 'lastActivity', Date.now());

	redis.sadd('list-' + room, nickname);
}

function removeUserFromList(redis, nickname, room) {
	redis.hdel('user-data-' + nickname + '-' + room, 'nickname');
	redis.hdel('user-data-' + nickname + '-' + room, 'connectedAt');
	redis.hdel('user-data-' + nickname + '-' + room, 'lastActivity');

	redis.srem('list-' + room, nickname);
}

function getUsers(redis, room, callback) {
	redis.smembers('list-' + room, function(err, members) {
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
				redis.hgetall('user-data-' + userID + '-' + room, userCallback);
			}
		}
	});
}

io.sockets.on('connection', function(socket) {
	socket.on('setNickname', function(nickname) {
		socket.set('nickname', nickname);
	});

	socket.on('join', function(room) {
		socket.set('room', room);
		socket.get('nickname', function(err, nickname) {
			addUserToList(datastore, nickname, room);
			getUsers(datastore, room, function(users) {
				io.sockets.emit('usersList', users);
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
	});
});
