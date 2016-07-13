'use strict';

const config = require('config');
const passport = require('passport');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const debug = require('debug')('App:Passport');

const authHeaderOpts = {
	jwtFromRequest: ExtractJwt.fromAuthHeader(),
	secretOrKey: config.get('config.jwt.secret')
};

const cookiesOpts = {
	jwtFromRequest: cookieExtractor,
	secretOrKey: config.get('config.jwt.secret')
};

module.exports = function (app, service) {
	passport.use('authHeader', new JwtStrategy(authHeaderOpts, processAuthHeaderPayload));
	passport.use('cookie', new JwtStrategy(cookiesOpts, processCookiePayload));

	function processPayload(jwt_payload, done) {
		return service.user
			.getUserFromSession(jwt_payload.user)
			.catch(err => {
				if (err.status === 404) {
					return false;
				}
				throw err;
			})
			.asCallback(done);
	}

	function processAuthHeaderPayload(jwt_payload, done) {
		debug('Process the JWT payload from the authentification header');
		processPayload(jwt_payload, done);
	}

	function processCookiePayload(jwt_payload, done) {
		debug('Process the JWT payload from the cookie header');
		processPayload(jwt_payload, done);
	}
};

function cookieExtractor(req) {
	var token = null;
	if (req && req.cookies) {
		token = req.cookies.jwt;
	}
	return token;
}
