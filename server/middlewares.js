'use strict';

const path = require('path');
const express = require('express');
const favicon = require('serve-favicon');
const logger = require('morgan-debug');
const methodOverride = require('method-override');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const errorHandler = require('errorhandler');
const passport = require('passport');

const i18n = require('i18next');
const i18nMiddleware = require('i18next-express-middleware');

const Core = require('./core');
const db = require('./utils/db');

module.exports = function (app) {
	require(path.join(__dirname, '..', 'common', 'helpers'))(app.locals);

	const envPath = app.get('env') === 'development' ? 'dev' : 'prod';

	app.use(express.static(path.join(__dirname, '..', 'dist', envPath), {maxage: 24 * 3600 * 30}));
	app.use('/api/doc', express.static(path.join(__dirname, '..', 'doc'), {maxage: 24 * 3600 * 30}));

	// uncomment after placing your favicon in /public
	app.use(favicon(path.join(__dirname, '..', 'client', 'favicon.ico')));
	app.use(logger('App:Express', 'dev'));
	app.use(methodOverride());
	app.use(passport.initialize());
	app.use(bodyParser.json());
	app.use(bodyParser.urlencoded({extended: true}));
	app.use(cookieParser());

	app.use(i18nMiddleware.handle(i18n, {
		removeLngFromUrl: false
	}));

	// Connection to mongodb
	app.use((req, res, next) => {
		db.connection();
		next();
	});

	const core = new Core(app);
	core.run();

	// error handling middleware should be loaded after the loading the routes
	if (app.get('env') === 'development') {
		app.use(errorHandler());
	}
};
