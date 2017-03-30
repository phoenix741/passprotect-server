'use strict';

import config from 'config';
import _ from 'lodash';
import Router from 'express-promise-router';
import i18n from 'i18next';
import {authenticate,permission,checkPermission} from 'server/utils/passport';
import {getUser,createSessionUser,verifyPassword} from 'server/services/user';
import moment from 'moment';
import jsonwebtoken from 'jsonwebtoken';
import fs from 'fs';
import path from 'path';
import debug from 'debug';

const log = debug('App:Controllers:Session');

const router = Router();
const jwt = Promise.promisifyAll(jsonwebtoken);

export default router;

log('Load session type definition');
export const typeDefs = [
	fs.readFileSync(path.join(__dirname, '..', '..', 'common', 'graphql', 'session.graphql'), 'utf-8'),
];

export const resolvers = {
	RootQuery: {
		session(obj, args, {user}) {
			return checkPermission(user).then(() => filterUser(user));
		}
	},

	RootMutation: {
		createSession(obj, {input}, {res}) {
			return sanitizeInput(input)
				.then(data => connectSession(data))
				.spread((user, jwtToken) =>  {
					res.cookie('jwt', jwtToken, {httpOnly: true/*, secure: true*/});
					return {token: 'JWT ' + jwtToken}
				})
				.catch(parseErrors);
		},

		clearSession(obj, args, {res}) {
			res.clearCookie('jwt');
		}
	},

	CreateSessionResult: {
		__resolveType(obj) {
			if (obj.errors) {
				return 'Errors';
			}

			return 'ConnectionInformation';
		}
	}
};

/**
 * @apiDefine ParamsLogin
 *
 * @apiParam {String} username User name
 * @apiParam {String} password Password of the user
 *
 * @apiParamExample {json} User:
 *   {
 *     "username": "myusername",
 *     "password": "mypassword"
 *   }
 */

/**
 * @apiDefine ResponseGet
 *
 * @apiSuccess {String} _id User name
 * @apiSuccess {Object} encryption Informations used for encrypted data
 * @apiSuccess {String} encryption.salt Salt added to encrypt the master key
 * @apiSuccess {Object} encryption.encryptedKey Encrypted master key
 * @apiSuccess {String} encryption.encryptedKey.content Master key encrypted with salt and password
 * @apiSuccess {String} encryption.encryptedKey.authTag Authentification tag of the master key
 * @apiSuccess {String} token JWT token used to authentify the user.
 * @apiSuccess {String} role Role of the user
 *
 * @apiSuccessExample {json} Success:
 *   HTTP/1.1 200 OK
 *   {
 *     "_id": "myusername",
 *     "encryption": {
 *         "salt": "395f68144ab82169",
 *         "encryptedKey": {
 *             "content": "7944424037f5c534a75e70b599eb82ec7d4b02ce6064773f661a7bc1114cb1d97627ed1ad701875a8aa3a11e2b6f3e36792168a8b6327b9158907d8414bba710",
 *             "authTag": "c2b485b1a20f025b3753e6b51e0a14e8"
 *         }
 *     },
 *     "token": "JWT eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7Il9pZCI6ImRlbW8ifSwiaWF0IjoxNDc2MDQxNDg4fQ.5mtQZBLdCCv1HconHU1TrFxcbjZVMdKE3UIjNFkhm2I",
 *     "role": "user"
 *   }
 */

/**
 * @apiDefine ResponseLogin
 *
 * @apiSuccess {String} _id User name
 * @apiSuccess {String} role Role of the user
 * @apiSuccess {String} token Token that should be used for user login
 *
 * @apiSuccessExample {json} Success:
 *   HTTP/1.1 200 OK
 *   {
 *     "_id": "myusername",
 *     "role": "user",
 *     "token": "JWT token"
 *   }
 */

router.route('')
/**
 * @api {get} /api/session Request a session

 * @apiDescription Request the current session of the user.
 *
 * @apiName GetSession
 * @apiGroup Session
 * @apiPermission ROLE_USER
 *
 * @apiUse ResponseGet
 *
 * @apiError Unauthorized Only a connected admin can see informations
 *
 * @apiErrorExample {json} Unauthorized:
 *     HTTP/1.1 401 Unauthorized
 *     {
 *       "code": 401,
 *       "message": "Unauthorized"
 *     }
 */
	.get(authenticate(), permission(), (req, res) => {
		res.status(200).json(filterUser(req.user));
	})

/**
 * @api {post} /api/session Create a session

 * @apiDescription Register the user session
 *
 * @apiName PostSession
 * @apiGroup Session
 * @apiPermission ROLE_USER
 *
 * @apiUse ParamsLogin
 * @apiUse ResponseGet
 *
 * @apiError Unauthorized The user can't be found
 *
 * @apiErrorExample {json} Unauthorized:
 *     HTTP/1.1 401 Unauthorized
 *     {
 *           "code": 401,
 *       "message": "Unauthorized"
 *     }
 */
	.post((req, res) => {
		return sanitizeInput(req.body)
			.then(data => connectSession(data))
			.spread(function(user, jwtToken) {
				user.token = 'JWT ' + jwtToken;
				res.cookie('jwt', jwtToken, {httpOnly: true/*, secure: true*/});
				res.status(200).json(filterUser(user));
			})
			.catch(err => {
				if (err.status === 404) {
					return res.status(401).send();
				}
				throw err;
			});
	})

/**
 * @api {delete} /api/session Delete a session

 * @apiDescription Delete the user session
 *
 * @apiName DeleteSession
 * @apiGroup Session
 * @apiPermission ROLE_USER
 *
 */
	.delete((req, res) => {
		req.logout();
		res.clearCookie('jwt');
		res.status(204).send();
	});

function sanitizeInput(input) {
	const data = _.pick(input, 'username', 'password');

	const validationError = new Error();
	validationError.status = 401;
	if (!_.isString(data.username) || _.isEmpty(data.username)) {
		validationError.message = i18n.t('error:user.401.username');
		return Promise.reject(validationError);
	}

	if (!_.isString(data.password) || _.isEmpty(data.password)) {
		validationError.message = i18n.t('error:user.401.password');
		return Promise.reject(validationError);
	}

	return Promise.resolve(data);
}

function connectSession({username, password}) {
	const user = getUser(username);

	const jwtToken = user
		.then(user => verifyPassword(user, password))
		.then(createSessionUser)
		.then(user => jwt.signAsync({user}, config.get('config.jwt.secret'), {}));

	return [user, jwtToken];
}

function filterUser(user) {
	return _.omit(user, 'password', 'confirmationToken');
}

function parseErrors(err) {
	return {
		errors: [{
			fieldName: err.field || 'global',
			message: err.message
		}]
	};
}
