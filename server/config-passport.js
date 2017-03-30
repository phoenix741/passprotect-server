'use strict';

import config from 'config';
import passport from 'passport';
import {Strategy as JwtStrategy, ExtractJwt} from 'passport-jwt';
import {Strategy as AnonymousStrategy} from 'passport-anonymous';
import debug from 'debug';
import {getUserFromSession} from 'server/services/user';

const log = debug('App:Passport');

const authHeaderOpts = {
	jwtFromRequest: ExtractJwt.fromAuthHeader(),
	secretOrKey: config.get('config.jwt.secret')
};

const cookiesOpts = {
	jwtFromRequest: cookieExtractor,
	secretOrKey: config.get('config.jwt.secret')
};

passport.use('authHeader', new JwtStrategy(authHeaderOpts, processAuthHeaderPayload));
passport.use('cookie', new JwtStrategy(cookiesOpts, processCookiePayload));
passport.use('anonymous', new AnonymousStrategy());

function processPayload(jwt_payload, done) {
	return getUserFromSession(jwt_payload.user)
		.catch(err => {
			if (err.status === 404) {
				return false;
			}
			throw err;
		})
		.asCallback(done);
}

function processAuthHeaderPayload(jwt_payload, done) {
	log('Process the JWT payload from the authentification header');
	processPayload(jwt_payload, done);
}

function processCookiePayload(jwt_payload, done) {
	log('Process the JWT payload from the cookie header');
	processPayload(jwt_payload, done);
}

function cookieExtractor(req) {
	var token = null;
	if (req && req.cookies) {
		token = req.cookies.jwt;
	}
	return token;
}
