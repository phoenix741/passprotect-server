'use strict';

const _ = require('underscore');
const db = require('../utils/db');
const i18n = require('i18next');
const crypto = require('crypto');

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
		getTransactions(filter, offset, limit) {
			const find = {};

			if (_.isString(filter.user)) {
				find.user = filter.user;
			}
			if (_.isDate(filter.earliest)) {
				find.updatedAt = {'$gte': filter.earliest};
			}

			return db.promise.then(db => {
				return Promise.fromCallback(cb => db.collection('transactions').find(find).sort({updatedAt: 1}).skip(offset).limit(limit).toArray(cb));
			});
		},

		create(transaction) {
			return db.promise.then(db => {
				return Promise.fromCallback(cb => db.collection('transactions').insert(transaction, cb));
			}).catch(processMongoException);
		}
	};

	function processNotFound(lineId, line) {
		if (!line) {
			throw new NotFoundError(i18n.t('error:line.404.lineNotFound', {lineId}));
		}
		return line;
	}
};
