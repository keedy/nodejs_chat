function Server() {
    this.port = 3333;
}

Server.prototype.initialize = function () {
    this.create();
}

Server.prototype.getPort= function () {
    return this.port;
}

Server.prototype.addEvent = function (name, fn) {
    this.instance.sockets.on(name, fn);
}

Server.prototype.create = function () {
    var io = require('socket.io').listen(this.port, {'log level': 1});

    //io.sockets.on('connection',);
    this.instance = io;
}

Server.prototype.close = function () {
    this.port ++;
    this.instance.server.close();
}

exports.Server = Server;