'use strict';

const _ = require('underscore');
const Promise = require('bluebird');
const db = require('../utils/db');
const i18n = require('i18next');
const ObjectID = require('mongodb').ObjectID;

const processMongoException = require('./exception').processMongoException;
const NotFoundError = require('./exception').NotFoundError;

/*
 * Model of a wallet line contains :
 *        _id: {type: ObjectId},
 *        user: {type: String},
 *        label: {type: String},
 *        note: {type: encrypted}
 *
 * And all other informations that a user want to store in the wallet line (depending on the wallet).
 */
module.exports = function () {
	return {
		getLines(filter, offset, limit) {
			const find = {};

			if (_.isString(filter.user)) {
				find.user = filter.user;
			}

			return db.promise.then(db => {
				return Promise.fromCallback(cb => db.collection('walletlines').find(find, {_id: 1, type: 1, label: 1}).skip(offset).limit(limit).toArray(cb));
			});
		},

		getLine(id) {
			return db.promise.then(db => {
				return Promise.fromCallback(cb => db.collection('walletlines').findOne({_id: new ObjectID(id)}, cb));
			}).catch(_.partial(processNotFound, id));
		},

		saveLine(line) {
			return db.promise.then(db => {
				return Promise.fromCallback(cb => db.collection('walletlines').save(line, cb)).return(line);
			}).catch(processMongoException);
		},

		removeLine(id) {
			return db.promise.then(db => {
				return Promise.fromCallback(cb => db.collection('walletlines').deleteOne({_id: new ObjectID(id)}, cb));
			}).catch(_.partial(processNotFound, id));
		}
	};

	function processNotFound(lineId, line) {
		if (!line) {
			throw new NotFoundError(i18n.t('error:line.404.lineNotFound', {lineId}));
		}
		return line;
	}
};
