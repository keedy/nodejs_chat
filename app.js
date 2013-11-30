var express = require('express'),
	app = express(),
	server = require('http').createServer(app),
	redis = require('redis'),
	store = redis.createClient(),
	pub = redis.createClient(),
	sub = redis.createClient(),
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

server.listen(80);

io.sockets.on('connection', function (socket) {
	socket.on('setNickname', function (nickname) {
   		socket.set('nickname', nickname);
	});

	socket.on('join', function(room) {
		socket.set('room', room);
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