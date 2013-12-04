var express = require('express'),
	app = express(),
	server = require('http').createServer(app),
	redis = require('redis'),
	store = redis.createClient(),
	jade = require('jade'),
	io = require('socket.io').listen(server);

app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.set("view options", { layout: false });
app.configure(function() {
   app.use(express.static(__dirname + '/public'));
});

app.get('/', function(req, res) {
	res.render('index.jade');
});

var config = require('./config');

server.listen(config.port);

function users(redis, room, callback) {
	redis.smembers(config.users + '_' + room, function(err, members) {
		var users = [];

		for(i = 0; i < members.length; ++i) {
			var id = members[i];
			redis.hgetall(userSession + '_' + room + '_' + channell, function(err, userData) {
				users.push({
					'nickname': userData.nickname
				})
			})
		}
	})
}

io.sockets.on('connection', function (socket) {
	socket.on('setNickname', function (nickname) {
   		socket.set('nickname', nickname);
	});

	socket.on('join', function(room) {
		socket.set('room', room);
		socket.get('nickname', function(err, nickname) {
   			store.sadd('users_' + room, nickname);
   		})
	});

	socket.on('updateUsers', function(users) {
   		var users = [];
		socket.get('room', function(err, room) {
			store.smembers('users_' + room, function(err, members) {

   			});
		});
	});

	socket.on('message', function (message) {
		socket.get('nickname', function(error, nickname) {
			socket.get('room', function(error, room) {
				var data = {'message' : message, 'nickname' : nickname, 'room': room};
				socket.broadcast.emit('message', data);
				console.log('user ' + nickname + ' send: ' + message + ' at room: ' + room);
			});
	   });
	});
});
