var io = require('socket.io')(8888);
var randToken = require('rand-token');

var usersByLogin = {}; // Имитируем базу данных
var usersByToken = {};

io.on('connection', function (socket) {
    socket.on('register', function (data, callback) {
        var login = data.login;
        if (!login) {
            return callback('Login cannot be empty');
        }
        if (login in usersByLogin) {
            return callback('User already exists');
        }
        var password = data.password;
        if (!password) {
            return callback('Password cannot be empty');
        }
        usersByLogin[login] = {
            login: login,
            password: password
        };
        return callback(null);
    });
    socket.on('login', function (data, callback) {
        var login = data.login;
        var password = data.password;
        if (!login) {
            return callback('Login cannot be empty');
        }
        if (!password) {
            return callback('Password cannot be empty');
        }
        var user = usersByLogin[login];
        if (!user || user.password !== password) {
            return callback('Incorrect login or password');
        }
        var token = randToken.generate(32);
        usersByToken[token] = user;
        user.token = token;
        return callback(null, token);
    });
    socket.on('logout', function (data) {
        var token = data.token;
        var user = usersByToken[token];
        if (user) {
            delete user.token;
        }
        delete usersByToken[user.token];
    });
    socket.on('message', function (data, callback) {
        var token = data.token;
        var user = usersByToken[token];
        if (!user) {
            return callback('User not found');
        }
        var message = data.message;
        if (message) {
            io.emit('message', {
                message: message,
                user: user.login
            });
            return callback(null);
        }
    });
});
