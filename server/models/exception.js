'use strict';

import debug from 'debug';
import i18n from 'i18next';

const log = debug('App:Models:Exception');

export class AuthorizationError extends Error {
	constructor(message) {
		super(message);
		this.name = 'AuthorizationError';
		this.status = 401;
	}
}

export class DuplicateKeyError extends Error {
	constructor(err, field) {
		super(i18n.t('error:global.400.duplicate'), err.id);
		this.originalError = err;
		this.name = 'DuplicateKeyError';
		this.status = 400;
		this.field = field;
	}
}

export class NotFoundError extends Error {
	constructor(message) {
		super(message);
		this.name = 'NotFoundError';
		this.status = 404;
	}
}

export function processMongoException(err) {
	if (err.name === 'MongoError' && err.code === 11000) {
		throw new DuplicateKeyError(err, '_id');
	}

	log(err);
	throw err;
}
