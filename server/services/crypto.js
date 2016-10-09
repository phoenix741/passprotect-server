'use strict';

const bcrypt = require('bcrypt-nodejs');

module.exports = function (models, services) {
	return {
		hashPassword(password) {
			const genSaltPromise = Promise.fromCallback(cb => bcrypt.genSalt(0, cb));
			return genSaltPromise.then(salt => Promise.fromCallback(cb => bcrypt.hash(password, salt, null, cb)));
		},

		checkPassword(password, hashedPassword) {
			return Promise.fromCallback(cb => bcrypt.compare(password, hashedPassword, cb));
		}
	};
};
