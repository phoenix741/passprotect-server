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

		createKeyDerivation(password, salt) {
			const iterations = config.get('config.crypto.pbkdf2.iterations');
			const keylen = config.get('config.crypto.pbkdf2.keylen');
			const digest = config.get('config.crypto.pbkdf2.digest');

			return Promise.fromCallback(cb => crypto.pbkdf2(password, salt, iterations, keylen, digest, cb)).then(splitBuffer);
		},

		generateIV() {
			return Promise.fromCallback(cb => crypto.randomBytes(config.get('config.crypto.ivSize'), cb)).then(iv => new Buffer(iv).toString('hex'));
		},

		generateKey() {
			return Promise.fromCallback(cb => crypto.randomBytes(config.get('config.crypto.keySize'), cb)).then(iv => new Buffer(iv).toString('hex'));
		},

		encrypt(text, key, iv) {
			const encryptor = crypto.createCipheriv(config.get('config.crypto.cypherIv.algorithm'), new Buffer(key, 'hex'), new Buffer(iv, 'hex'));
			encryptor.write(text);
			encryptor.end();

			const promise = streamToPromise(encryptor);
			return promise.then(content => {
				return {
					content: new Buffer(content).toString('hex'),
					tag: encryptor.getAuthTag().toString('hex')
				};
			});
		},

		decrypt(text, key, iv) {
			const decryptor = crypto.createDecipheriv(config.get('config.crypto.cypherIv.algorithm'), new Buffer(key, 'hex'), new Buffer(iv, 'hex'));
			decryptor.setAuthTag(new Buffer(text.tag, 'hex'));
			decryptor.write(text.content, 'hex');
			decryptor.end();

			return streamToPromise(decryptor);
		}
	};
};

function splitBuffer(array) {
	const length = array.length / 2;
	return {
		key: Buffer.from(array.buffer, 0, length).toString('hex'),
		iv: Buffer.from(array.buffer, length, length).toString('hex')
	};
}
