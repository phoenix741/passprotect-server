'use strict';

const _ = require('underscore');
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
 *        type: {type: String},
 *        encryption: {type: encrypted Object}
 *        updatedAt: {type: Date}
 *        _rev: {type: Number}
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

		getLine(id, _rev) {
			const query = {_id: new ObjectID(id)};
			if (_rev !== undefined) {
				query._rev = _rev;
			}

			return db.promise.then(db => {
				return Promise.fromCallback(cb => db.collection('walletlines').findOne(query, cb));
			}).then(_.partial(processNotFound, id));
		},

		saveLine(line) {
			const cleanLine = _.omit(line, '_rev');
			const revision = line._rev;
			const query = {_id: new ObjectID(line._id)};
			if (revision) {
				query._rev = revision;
			}

			return db.promise.then(db => {
				return Promise.fromCallback(cb => db.collection('walletlines').findOneAndUpdate(query, {$set: cleanLine, $inc: {_rev: 1}}, {returnOriginal: false, upsert: true}, cb)).then(doc => doc.value);
			}).catch(processMongoException);
		},

		removeLine(id) {
			return db.promise.then(db => {
				return Promise.fromCallback(cb => db.collection('walletlines').deleteOne({_id: new ObjectID(id)}, cb));
			}).then(_.partial(processNotFound, id));
		}
	};

	function processNotFound(lineId, line) {
		if (!line) {
			throw new NotFoundError(i18n.t('error:line.404.lineNotFound', {lineId}));
		}
		return line;
	}
};
