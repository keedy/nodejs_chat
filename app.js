var express = require('express'),
	app = express(),
	server = require('http').createServer(app),
	redis = require('redis'),
	jade = require('jade'),
	io = require('socket.io').listen(server);

app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.set("view options", { layout: false });
app.configure(function() {
   app.use(express.static(__dirname + '/public'));
});

app.use(express.cookieParser());
app.use(express.session({secret: '2344235456568QWERTY@#$%^&*'}));

app.get('/', function(req, res) {
	res.render('home.jade');
});

server.listen(80);

io.sockets.on('connection', function (socket) {
	socket.on('setNickname', function (nickname) {
   		socket.set('nickname', nickname);
	});

	socket.on('message', function (message) {
		socket.get('nickname', function(error, name) {
			var data = {'message' : message, 'nickname' : name};
			socket.broadcast.emit('message', data);
			console.log("user " + name + " send this : " + message);
	   });
	});
});