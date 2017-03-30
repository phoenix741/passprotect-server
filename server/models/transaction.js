'use strict';

import _ from 'lodash';
import {promise as dbPromise} from 'server/utils/db';
import i18n from 'i18next';
import crypto from 'crypto';

import { processMongoException, NotFoundError } from './exception';

/*
 * Model of a wallet line contains :
 *        _id: {type: ObjectId},
 *        user: {type: String},
 *        label: {type: String},
 *        note: {type: encrypted}
 *
 * And all other informations that a user want to store in the wallet line (depending on the wallet).
 */
export function getTransactions(filter) {
	const find = {};

	if (_.isString(filter.user)) {
		find.user = filter.user;
	}
	if (_.isDate(filter.earliest)) {
		find.updatedAt = { '$gte': filter.earliest };
	}

	return dbPromise.then(db => {
		return Promise.fromCallback(cb => db.collection('transactions').find(find).sort({ updatedAt: 1 }).toArray(cb));
	});
}

export function createTransaction(transaction) {
	return dbPromise.then(db => {
		return Promise.fromCallback(cb => db.collection('transactions').insert(transaction, cb));
	}).catch(processMongoException);
}

function processNotFound(lineId, line) {
	if (!line) {
		throw new NotFoundError(i18n.t('error:line.404.lineNotFound', { lineId }));
	}
	return line;
}