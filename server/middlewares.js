'use strict';

import path from 'path';
import express from 'express';
import favicon from 'serve-favicon';
import logger from 'morgan-debug';
import methodOverride from 'method-override';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import errorHandler from 'errorhandler';
import passport from 'passport';

import i18n from 'i18next';
import i18nMiddleware from 'i18next-express-middleware';

import {Core} from './core';
import {connection as dbConnection} from 'server/utils/db';

export default function middlewares(app) {
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
		dbConnection();
		next();
	});

	// error handling middleware should be loaded after the loading the routes
	if (app.get('env') === 'development') {
		app.use(errorHandler());
	}

	const core = new Core(app);
	core.run();
}
