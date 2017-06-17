'use strict';

import {pick, omit, isString, isEmpty, isObject} from 'lodash';
import expressPromiseRouter from 'express-promise-router';
import i18n from 'i18next';
import debug from 'debug';
import fs from 'fs';
import path from 'path';
import {authenticate,permission,checkPermission} from '../utils/passport';
import {getUsers,getUser,registerUser} from '../services/user';

const log = debug('App:Controllers:User');

const router = expressPromiseRouter();
export default router;

log('Load user type definition');
export const typeDefs = [
	fs.readFileSync(path.join(__dirname, '..', '..', '..', 'common', 'graphql', 'user.graphql'), 'utf-8')
];

export const resolvers = {
	RootQuery: {
		users(obj, args, {user}) {
			return checkPermission(user, ['admin']).then(getUsers).map(filterUser);
		},

		user(obj, {id}, {user}) {
			return checkPermission(user, ['admin'], id).then(() => getUser(id)).then(filterUser);
		}
	},
	WalletLine: {
		user(obj, args, {user}) {
			return checkPermission(user, ['admin'], obj.user).then(() => getUser(obj.user)).then(filterUser);
		}
	},
	WalletTransaction: {
		user(obj, {id}, {user}) {
			return checkPermission(user, ['admin'], id).then(() => getUser(obj.user)).then(filterUser);
		}
	},

	RootMutation: {
		registerUser(obj, {input}) {
			return sanitizeUser(input)
				.then(data => registerUser(data))
				.then(filterUser)
				.catch(parseErrors);
		}
	},

	RegisterUserResult: {
		__resolveType(obj) {
			if (obj.errors) {
				return 'Errors';
			}

			return 'User';
		}
	}
};

/**
 * @apiDefine ParamsUpdate
 *
 * @apiParam {String} _id User name
 * @apiParam {Object} encryption Informations used for encrypted data
 * @apiParam {String} encryption.salt Salt added to encrypt the master key
 * @apiParam {Object} encryption.encryptedKey Encrypted master key
 * @apiParam {String} encryption.encryptedKey.content Master key encrypted with salt and password
 * @apiParam {String} encryption.encryptedKey.authTag Authentification tag of the master key
 * @apiParam {String} password Password of the user
 *
 * @apiParamExample {json} User:
 *   {
 *     "_id": "myusername",
 *     "password": "mypassword"
 *   }
 */

/**
 * @apiDefine ResponseUpdateComplete
 *
 * @apiSuccess {String} _id User name
 * @apiSuccess {Object} encryption Informations used for encrypted data
 * @apiSuccess {String} encryption.salt Salt added to encrypt the master key
 * @apiSuccess {Object} encryption.encryptedKey Encrypted master key
 * @apiSuccess {String} encryption.encryptedKey.content Master key encrypted with salt and password
 * @apiSuccess {String} encryption.encryptedKey.authTag Authentification tag of the master key
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
 *     "role": "user"
 *   }
 */
router.route('')
/**
 * @api {get} /api/users Request all users

 * @apiDescription Request the list of users from the database. Only non-sensitive informations are available. Only
 * the adminstrator can access to this API.
 *
 * @apiName GetUsers
 * @apiGroup User
 * @apiPermission ROLE_ADMIN
 *
 * @apiParam {Number} [offset=0] Offset for pagination
 * @apiParam {Number} [limit=10000] Limit of users used for pagination
 *
 * @apiSuccess {String} _id User name.
 * @apiSuccess {String="user","admin"} role Role of the user.
 *
 * @apiSuccessExample Success:
 *     HTTP/1.1 200 OK
 *     [
 *       {
 *         "_id": "test",
 *         "role": "user"
 *       },
 *       {
 *         "_id": "test2",
 *         "role": "user"
 *       },
 *     ]
 *
 * @apiError Unauthorized Only a connected admin can see informations
 * @apiError Forbidden Only the admin role can access to this informations
 *
 * @apiErrorExample {json} Unauthorized:
 *     HTTP/1.1 401 Unauthorized
 *     {
 *       "code": 401,
 *       "message": "Unauthorized"
 *     }
 *
 * @apiErrorExample {json} Forbidden:
 *     HTTP/1.1 403 Forbidden
 *     {
 *       "code": 403,
 *       "message": "Forbidden"
 *     }
 */
	.get(authenticate(), permission(['admin']), (req, res) => {
		return getUsers().map(filterUser).then(res.json.bind(res));
	})
/**
 * @api {post} /api/users Register a new user
 * @apiName PostUsers
 * @apiGroup User
 *
 * @apiUse ParamsUpdate
 * @apiUse ResponseUpdateComplete
 */
	.post((req, res) => {
		return sanitizeUser(req.body)
			.then(data => registerUser(data))
			.then(user => res.json(filterUser(user)));
	});

/**
 * @api {get} /api/users/:userId Request a user
 * @apiName GetUser
 * @apiGroup User
 * @apiPermission ROLE_USER
 *
 * @apiParam {String} userId The user id
 *
 * @apiUse ResponseUpdateComplete
 *
 * @apiError Unauthorized Only a connected user can call this method
 * @apiError Forbidden Only the user connected can access to it's information
 *
 * @apiErrorExample {json} Unauthorized:
 *     HTTP/1.1 401 Unauthorized
 *     {
 *       "code": 401,
 *       "message": "Unauthorized"
 *     }
 *
 * @apiErrorExample {json} Forbidden:
 *     HTTP/1.1 403 Forbidden
 *     {
 *       "code": 403,
 *       "message": "Forbidden"
 *     }
 */
router.route('/:userId')
	.get(authenticate(), permission(), function (req, res) {
		if (req.params.userId !== req.user._id) {
			const error = new Error('Forbidden');
			error.status = 403;
			return Promise.reject(error);
		}

		return res.json(filterUser(req.user));
	});

function sanitizeUser(input) {
	const data = pick(input, '_id', 'password', 'encryption');

	const validationError = new Error();
	validationError.status = 400;
	if (!isString(data._id) || isEmpty(data._id)) {
		validationError.message = i18n.t('error:user.400._id');
		return Promise.reject(validationError);
	}

	if (!isString(data.password) || isEmpty(data.password) || data.password.length < 8) {
		validationError.message = i18n.t('error:user.400.password');
		return Promise.reject(validationError);
	}

	if (!isObject(data.encryption)) {
		validationError.message = i18n.t('error:user.400.encryption');
		return Promise.reject(validationError);
	}

	data.encryption = pick(data.encryption, 'salt', 'encryptedKey');

	if (!isObject(data.encryption.encryptedKey) || !isString(data.encryption.salt)) {
		validationError.message = i18n.t('error:user.400.encryption');
		return Promise.reject(validationError);
	}

	data.encryption.encryptedKey = pick(data.encryption.encryptedKey, 'content', 'authTag');

	if (!isString(data.encryption.encryptedKey.content) || !isString(data.encryption.encryptedKey.authTag)) {
		validationError.message = i18n.t('error:user.400.encryption');
		return Promise.reject(validationError);
	}

	return Promise.resolve(data);
}

function filterUser(user) {
	return omit(user, 'password', 'confirmationToken');
}

function parseErrors(err) {
	return {
		errors: [{
			fieldName: err.field || 'global',
			message: err.message
		}]
	};
}
