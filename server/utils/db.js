'use strict';

const Promise = require('bluebird');
const MongoClient = require('mongodb').MongoClient;
const config = require('config');
const debug = require('debug')('App:Utils:Db');

module.exports.promise = null;
module.exports.db = null;

module.exports.connection = connection;

function connection() {
	if (!module.exports.promise) {
		module.exports.promise = Promise.fromCallback(cb => MongoClient.connect(config.get('config.mongodb.host'), config.get('config.mongodb.options'), cb))
			.then((db) => {
				debug('Express server connected to mongodb host ' + config.get('config.mongodb.host'));
				module.exports.db = db;
				return db;
			}).catch(err => {
				module.exports.promise = null;
				throw err;
			});
	}

	return module.exports.promise;
}

connection().catch(err => debug('Can\'t connect to mongodb', err));
