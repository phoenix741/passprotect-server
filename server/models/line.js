'use strict';

import _  from 'lodash';
import {promise as dbPromise} from 'server/utils/db';
import i18n from 'i18next';
import { ObjectID } from 'mongodb';

import { processMongoException, NotFoundError } from './exception';

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
export function getLines(filter, sort) {
	const find = {};

	if (_.isString(filter.user)) {
		find.user = filter.user;
	}

	return dbPromise.then(db => {
		return Promise.fromCallback(cb => db.collection('walletlines').find(find).sort(sort).toArray(cb));
	});
}

export function getLine(id, _rev) {
	const query = { _id: new ObjectID(id) };
	if (_rev !== undefined) {
		query._rev = _rev;
	}

	return dbPromise.then(db => {
		return Promise.fromCallback(cb => db.collection('walletlines').findOne(query, cb));
	}).then(_.partial(processNotFound, id));
}

export function saveLine(line) {
	const cleanLine = _.omit(line, '_rev');
	const revision = line._rev;
	const query = { _id: new ObjectID(line._id) };
	if (revision) {
		query._rev = revision;
	}

	return dbPromise.then(db => {
		return Promise.fromCallback(cb => db.collection('walletlines').findOneAndUpdate(query, { $set: cleanLine, $inc: { _rev: 1 } }, { returnOriginal: false, upsert: true }, cb)).then(doc => doc.value);
	}).catch(processMongoException);
}

export function removeLine(id) {
	return dbPromise.then(db => {
		return Promise.fromCallback(cb => db.collection('walletlines').deleteOne({ _id: new ObjectID(id) }, cb));
	}).then(_.partial(processNotFound, id));
}

function processNotFound(lineId, line) {
	if (!line) {
		throw new NotFoundError(i18n.t('error:line.404.lineNotFound', { lineId }));
	}
	return line;
}
