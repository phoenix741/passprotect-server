'use strict';

const config = require('config');
const Promise = require('bluebird');
const bcrypt = require('bcrypt-nodejs');
const crypto = require('crypto');

const streamToPromise = require('stream-to-promise');

module.exports = function (models, services) {
	return {
		hashPassword(password) {
			const genSaltPromise = Promise.fromCallback(cb => bcrypt.genSalt(0, cb));
			return genSaltPromise.then(salt => Promise.fromCallback(cb => bcrypt.hash(password, salt, null, cb)));
		},

		checkPassword(password, hashedPassword) {
			return Promise.fromCallback(cb => bcrypt.compare(password, hashedPassword, cb));
		},

		generateIV() {
			return Promise.fromCallback(cb => crypto.randomBytes(16, cb)).then(iv => new Buffer(iv).toString('hex'));
		},

		generateKey() {
			return Promise.fromCallback(cb => crypto.randomBytes(32, cb)).then(iv => new Buffer(iv).toString('hex'));
		},

		encrypt(text, key, iv) {
			const hashedKey = crypto.createHash(config.get('config.crypto.hashAlgorithm')).update(key).digest();
			const encryptor = crypto.createCipheriv(config.get('config.crypto.cypherAlgorithm'), hashedKey, new Buffer(iv, 'hex'));
			encryptor.write(text);
			encryptor.end();

			const promise = streamToPromise(encryptor);
			return promise.then(data => data.toString('hex'));
		},

		decrypt(text, key, iv) {
			const hashedKey = crypto.createHash(config.get('config.crypto.hashAlgorithm')).update(key).digest();
			const decryptor = crypto.createDecipheriv(config.get('config.crypto.cypherAlgorithm'), hashedKey, new Buffer(iv, 'hex'));
			decryptor.write(text, 'hex');
			decryptor.end();

			return streamToPromise(decryptor);
		}
	};
};
