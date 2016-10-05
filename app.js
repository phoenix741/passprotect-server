'use strict';

const Promise = require('bluebird');
global.Promise = Promise;

var express = require('express');
var debug = require('debug')('App:Server');
var path = require('path');

var app = express();

require('./server/bootstrap')(app.get('env'));

// all environments
app.set('port', process.env.PORT || 3000);

// view engine setup
app.set('views', path.join(__dirname, 'common', 'templates'));
app.set('view engine', 'jade');

require('./server/middlewares')(app);

app.listen(app.get('port'), function () {
	debug('Express server listening on port ' + app.get('port'));
});
