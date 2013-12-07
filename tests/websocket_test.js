var Server = require('../tests/server.js').Server,
    wsServer = new Server(),
    ioclient = require("socket.io-client"),
    testCase = require('nodeunit').testCase;

exports.server = testCase({

    setUp: function(callback) {

        wsServer.initialize();

        wsServer.addEvent('connection', function(socket) {
            socket.on('ping', function(data) {
                socket.emit('ping', {value: 'ok'});
                socket.disconnect();
            });
        });

        callback();
    },

    tearDown: function(callback) {
        wsServer.close();
        callback();
    },

    'ping test': function(test) {
        var clientsocket = ioclient.connect('http://localhost:' + wsServer.getPort());
        clientsocket.on('ping', function(data) {
            test.equal('ok', data.value);
            test.done();
        });

        clientsocket.emit('ping', {pingRequest: '1'});

    },

    'another ping test': function(test) {
        var clientsocket = ioclient.connect('http://localhost:' + wsServer.getPort());
        clientsocket.on('ping', function(data) {
            test.equal('ok', data.value);
            test.done();
        });

        clientsocket.emit('ping', {pingRequest: '1'});
    }
});