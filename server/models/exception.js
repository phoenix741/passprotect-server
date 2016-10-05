'use strict';

const debug = require('debug')('App:Models:Exception');

class DuplicateKeyError extends Error {
	constructor(err) {
		super(err.message, err.id);
		this.originalError = err;
		this.name = 'DuplicateKeyError';
		this.status = 400;

		const searchFieldRegexp = /E11000 duplicate key error collection:\s+\w+\.\w+\s+index:\s+(\w+)_\s+dup key/g;
		const fields = searchFieldRegexp.exec(err.errmsg);
		this.field = fields.length > 1 ? fields[1] : null;
	}
}

class NotFoundError extends Error {
	constructor(message) {
		super(message);
		this.name = 'NotFoundError';
		this.status = 404;
	}
}

class AuthorizationError extends Error {
	constructor(message) {
		super(message);
		this.name = 'AuthorizationError';
		this.status = 401;
	}
}

module.exports.DuplicateKeyError = DuplicateKeyError;
module.exports.NotFoundError = NotFoundError;
module.exports.AuthorizationError = AuthorizationError;
module.exports.processMongoException = processMongoException;

function processMongoException(err) {
	if (err.name === 'MongoError' && err.code === 11000) {
		throw new DuplicateKeyError(err);
	}

	debug(err);
	throw err;
}
