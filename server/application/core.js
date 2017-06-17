'use strict';

import debug from 'debug';
import i18n from 'i18next';

import path from 'path';
import express from 'express';
import http from 'http';

import {websocketVerifyClient as verifyClient}  from './config-passport';
import userRouter from './controllers/user';
import sessionRouter from './controllers/session';
import lineRouter from './controllers/line';
import transactionRouter from './controllers/transaction';
import graphqlRouter, {subscriptionManager} from './controllers/graphql';
import { graphiqlExpress } from 'graphql-server-express';
import { SubscriptionServer } from 'subscriptions-transport-ws';

const log = debug('App:Core');

export class Core {
	constructor(app) {
		this.app = app;
		this.server = http.createServer(this.app);

		this.createControllers(app);
		this.createSubscriptionManager(app);
	}

	createControllers(app) {
		app.use('/api/users', userRouter);
		app.use('/api/transactions', transactionRouter);
		app.use('/api/session', sessionRouter);
		app.use('/api/lines', lineRouter);
		app.use('/api/graphql', graphqlRouter);
		app.use('/graphiql', graphiqlExpress({
			endpointURL: '/api/graphql',
			subscriptionsEndpoint: '\' + (window.location.protocol === \'https\' ? \'wss://\' : \'ws://\') + window.location.host + \'/subscriptions'
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

	createSubscriptionManager(app) {
		this.subscriptionsServer = new SubscriptionServer(
			{
				subscriptionManager,
				onConnect(connectionParams, webSocket) {
					return {
						user: webSocket.upgradeReq.user
					};
				}
			},
			{
				server: this.server,
				path: '/subscriptions',
				verifyClient
			}
		);
	}

	run() {
		this.server.listen(this.app.get('port'), () => log('Express server listening on port ' + this.app.get('port')));
	}
}
