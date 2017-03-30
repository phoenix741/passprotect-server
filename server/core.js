'use strict';

import _ from 'lodash';
import debug from 'debug';
import i18n from 'i18next';

import path from 'path';
import express from 'express';

import './config-passport';
import userRouter from 'server/controllers/user';
import sessionRouter from 'server/controllers/session';
import lineRouter from 'server/controllers/line';
import transactionRouter from 'server/controllers/transaction';
import graphqlRouter, {graphiqlRouter} from 'server/controllers/graphql';
import { graphiqlExpress } from 'graphql-server-express';


const log = debug('App:Core');

export class Core {
	constructor(app) {
		this.createControllers(app);
	}

	createControllers(app, services) {
		app.use('/api/users', userRouter);
		app.use('/api/transactions', transactionRouter);
		app.use('/api/session', sessionRouter);
		app.use('/api/lines', lineRouter);
		app.use('/api/graphql', graphqlRouter);
		app.use('/graphiql', graphiqlExpress({
			endpointURL: '/api/graphql'
		}));

		app.use(express.static(path.join(__dirname, '..', 'dist', 'dev')));

		app.use((err, req, res, next) => {
			log(err);

			if (err && err.name === 'DuplicateKeyError') {
				return res.status(400).json({
					code: 400, message: {
						[err.field]: i18n.t('error:global.400.duplicate')
					}
				});
			}

			if (err && err.status) {
				return res.status(err.status).send({code: err.status, message: err.message});
			}

			return res.status(500).send({code: 500, message: i18n.t('error:global.500.unknown')});
		});
	}

	run() {

	}
}
