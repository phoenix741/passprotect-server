'use strict';

const _ = require('underscore');
const router = require('express-promise-router')();
const authenticate = require('../utils/passport').authenticate;
const permission = require('../utils/passport').permission;
const config = require('config');
const jwt = Promise.promisifyAll(require('jsonwebtoken'));

module.exports = function (app, services) {
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
	 	 *       "code": 401,
	 	 *       "message": "Unauthorized"
	 	 *     }
		 */
		.post((req, res) => {
			if (!(req.body.username && req.body.password)) {
				return res.status(401).send();
			}

			const username = req.body.username;
			const password = req.body.password;

			const getUser = services.user.getUser(username);
			const payload = getUser
				.then(_.partial(services.user.verifyPassword, _, password))
				.then(services.user.createSessionUser);
			const jwtToken = payload.then(payload => jwt.signAsync({user: payload}, config.get('config.jwt.secret'), {}));

			return Promise.props({getUser, jwtToken})
				.then(function (result) {
					result.getUser.token = 'JWT ' + result.jwtToken;
					res.cookie('jwt', result.jwtToken, {httpOnly: true/*, secure: true*/});
					res.status(200).json(filterUser(result.getUser));
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

	app.use('/api/session', router);

	function filterUser(user) {
		return _.omit(user, 'password', 'confirmationToken');
	}
};
