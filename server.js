var express = require('express'),
	app = express(),
	server = require('http').createServer(app),
	redis = require('redis'),
	store = redis.createClient(),
	io = require('socket.io').listen(server);

app.set('views', __dirname + '/views');
app.set('view engine', 'twig');
app.configure(function() {
   app.use(express.static(__dirname + '/public'));
});

app.get('/', function(req, res) {
	res.render('index.twig');
});

var config = require('./config');
function addUserToList(redis, nickname, room) {
	redis.hset('user-data-' + nickname + '-' + room, 'nickname', nickname);
	redis.hset('user-data-' + nickname + '-' + room, 'connectedAt', Date.now());
	redis.hset('user-data-' + nickname + '-' + room, 'lastActivity', Date.now());

	redis.sadd('list-' + room, nickname);
}
server.listen(config.port);

function getUsers(redis, room, callback) {
	redis.smembers('list-' + room, function(err, members) {
		var users = [];
		var i = 0;
		var numCompleted = 0;

		var markAsCompleted = function() {
			numCompleted++;

			if(numCompleted == members.length) {
				callback(users);
			}
		};

		if(!members || members.length === 0) {
			callback([]);
		}
		else {
			for(i = 0; i < members.length; ++i) {
				var userID = members[i];
				redis.hgetall('user-data-' + userID + '-' + room, function(err, userData) {
					users.push({
						'nickname': userData.nickname,
						'connectedAt': userData.connectedAt
					});
					markAsCompleted();
				});
			}
		}
	});
}

io.sockets.on('connection', function (socket) {
	socket.on('setNickname', function (nickname) {
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
