var env = {};

env.express = require('express');
env.path = require('path');
env.favicon = require('serve-favicon');
env.http = require('http');
env.logger = require('morgan');
env.cookieParser = require('cookie-parser');
env.bodyParser = require('body-parser');
env.session = require('express-session');
env.mongoClient = require('mongodb').MongoClient;
env.assert = require('assert');
env.app = env.express();

// Connect to mongodb server
var mongoUrl = 'mongodb://localhost/coords';
env.mongoClient.connect(mongoUrl, function(err,db) {
    env.assert.equal(null,err);
    env.mongo = db;
    console.log('Connected to ' + mongoUrl);
});

require('./modules/oauth.js')(env);
require('./modules/socketio.js')(env);
require('./modules/rooms.js')(env);

env.app.use(env.express.static(env.path.join(__dirname, 'public')));
env.app.use('/', require('./routes/index'));

// enable dev logging
env.app.use(env.logger('dev'));

// catch 404 and forward to error handler
env.app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (env.app.get('env') === 'development') {
    env.app.use(function(err, req, res, next) {
        res.status(err.status || 500);
	res.status(err.status || 500).send( '<pre>' + err.stack + '</pre>' );
    });
}

// production error handler
// no stacktraces leaked to user
env.app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.send( err.message );
});


module.exports = env.app;
