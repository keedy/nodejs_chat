var express = require('express'),
	app = express(),
	server = require('http').createServer(server),
	io = require('socket.io').listen(server);