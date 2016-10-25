'use strict';

const crypto = require('crypto');
const streamToPromise = require('stream-to-promise');

module.exports.createKeyDerivation = function (password, salt, options) {
	const iterations = options.iterations;
	const keylen = options.keylen / 8;
	const ivlen = options.ivlen / 8;
	const digest = options.digest;

	return Promise.fromCallback(cb => crypto.pbkdf2(password, salt, iterations, keylen + ivlen, digest, cb)).then(_.partial(splitBuffer, _, keylen, ivlen));
};

module.exports.generateIV = function (size) {
	return Promise.fromCallback(cb => crypto.randomBytes(size / 8, cb)).then(iv => new Buffer(iv).toString('hex'));
};

module.exports.generateKey = function (size) {
	return Promise.fromCallback(cb => crypto.randomBytes(size / 8, cb)).then(iv => new Buffer(iv).toString('hex'));
};

module.exports.encrypt = function (text, key, iv, options) {
	const encryptor = crypto.createCipheriv(options.algorithm, new Buffer(key, 'hex'), new Buffer(iv, 'hex'));
	encryptor.write(text);
	encryptor.end();

	const promise = streamToPromise(encryptor);
	return promise.then(content => {
		return {
			content: new Buffer(content).toString('hex'),
			authTag: encryptor.getAuthTag().toString('hex')
		};
	});
};

module.exports.decrypt = function (text, key, iv, options) {
	const decryptor = crypto.createDecipheriv(options.algorithm, new Buffer(key, 'hex'), new Buffer(iv, 'hex'));
	decryptor.setAuthTag(new Buffer(text.authTag, 'hex'));
	decryptor.write(text.content, 'hex');
	decryptor.end();

	return streamToPromise(decryptor);
};

function splitBuffer(array, keylen, ivlen) {
	return {
		key: Buffer.from(array.buffer, 0, keylen).toString('hex'),
		iv: Buffer.from(array.buffer, keylen, ivlen).toString('hex')
	};
}
