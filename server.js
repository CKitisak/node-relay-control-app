var debug = require('debug')('Relay-App');
var express = require('express');
var five = require('johnny-five');
var http = require('http');
var path = require('path');
var rpi = require('raspi-io');
var socketIO = require('socket.io');

// Init Board
var board = new five.Board({
    io: new rpi()
});

// Board is ready
board.on('ready', function() {
    debug('board is ready');

    // Board on exit
    this.on('exit', function() {
        debug('exit');
    });

    // create http server with express and socket.io
    var app = express();
    var server = http.Server(app);
    var io = socketIO(server);

    // running port
    server.listen(8080);

    // socket.io
    io.on('connection', function (socket) {
        socket.emit('connected', { message: 'you are connected' });

        socket.on('toggle', function(data) {
            debug(data);
            
            switch (data.switch) {
                case 1:
                    pin = 'P1-11';
                    break;
                case 2:
                    pin = 'P1-13';
                    break;
                case 3:
                    pin = 'P1-15';
                    break;
                case 4:
                    pin = 'P1-12';
                    break;
                case 5:
                    pin = 'P1-16';
                    break;
                case 6:
                    pin = 'P1-18';
                    break;
                default: 
                    break;
            };

            if (pin) {
                var relay = new five.Relay(pin);

                if (data.state) {
                    relay.on();
                } else {
                    relay.off();
                }

                socket.emit('toggle', data);
            }
        });
    });

    // socket.io library
    app.get('/socketio', function(req, res) {
        res.sendFile(path.join(__dirname, 'node_modules/socket.io-client/dist/socket.io.min.js'));
    });

    // app
    app.get('/', function (req, res) {
        res.sendFile(path.join(__dirname, 'app/index.html'));
    });
});
