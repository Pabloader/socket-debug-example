var should = require('should');
var io = require('socket.io-client');
var randToken = require('rand-token');

var url = 'http://0.0.0.0:8888/';

var options = {
    transports: ['websocket'],
    'force new connection': true
};

describe('Server', function () {
    it('should register new user and login', function (done) {
        var client = io.connect(url, options);
        client.on('connect', function () {
            var user = generateUser();
            client.emit('register', user, function (err) {
                should.not.exist(err);
                client.emit('login', user, function (err, token) {
                    should.not.exist(err);
                    should(token).be.ok();
                    done();
                });
            });
        });
        client.on('connect_error', function (e) {
            should.not.exist(e);
        });
    });
    it('should send and receive message', function (done) {
        var client = io.connect(url, options);
        var message = randToken.generate(128);
        client.on('connect', function () {
            var user = generateUser();
            client.emit('register', user, function (err) {
                should.not.exist(err);

                client.emit('login', user, function (err, token) {
                    should.not.exist(err);
                    should(token).be.ok();

                    client.on('message', function (data) {
                        should(data).have.properties('message', 'user');
                        if (data.user === user.login) {
                            should(data.message).be.equal(message);
                            done();
                        }
                    });
                    client.emit('message', {token: token, message: message}, function (err) {
                        should.not.exist(err);
                    });
                });
            });
        });
        client.on('connect_error', function (e) {
            should.not.exist(e);
        });
    });
});

function generateUser() {
    return {login: 'user_' + randToken.generate(8), password: randToken.generate(6)};
}
