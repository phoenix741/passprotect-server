'use strict';

const _ = require('underscore');
const router = require('express-promise-router')();
const i18n = require('i18next');
const authenticate = require('../utils/passport').authenticate;
const permission = require('../utils/passport').permission;

module.exports = function (app, services) {
	/**
	 * @apiDefine text Informations to encrypt (client side) for text
	 */
	/**
	 * @apiDefine password Informations to encrypt (client side) for password
	 */
	/**
	 * @apiDefine card Informations to encrypt (client side) for payment card
	 */

	/**
	 * @apiDefine UpdateLine
	 *
	 * @apiParam {String="text","card","password"} type type of line
	 * @apiParam {String} label label of the line
	 * @apiParam {Object} encryption Informations used for encrypted data
	 * @apiParam {Object} encryption.informations Encrypted informations
	 * @apiParam {String} encryption.informations.authTag Authentification tag of the encrypted information
	 * @apiParam {String} encryption.informations.content Encrypted informations
	 * @apiParam {String} encryption.salt Salt used to encrypt/decrypt informations
	 *
	 * @apiParam (text) {String} text Text that will be encrypted
	 * @apiParam (text) {String} notes Custom note added to the line
	 *
	 * @apiParam (password) {String} username Username associated to the pasword
	 * @apiParam (password) {String} password The password
	 * @apiParam (password) {String} siteUrl The site where the password is used
	 * @apiParam (password) {String} notes Custom note added to the line
	 *
	 * @apiParam (card) {String="VISA","Carte bleu","Mastercard","American Express","Maestro"} type Type of card
	 * @apiParam (card) {String} nameOnCard Name of the person on the card
	 * @apiParam (card) {String} cardNumber The card number
	 * @apiParam (card) {String} cvv The code in the back on the card
	 * @apiParam (card) {String} expiry The expiration date
	 * @apiParam (card) {String} code The code to use to pay with the card
	 * @apiParam (card) {String} notes Custom note added to the line
	 *
	 * @apiParamExample {json} Line:
	 *   {
	 *     "type": "text",
	 *     "label": "My custom text",
	 *     "encryption": {
	 *       "salt": "83b01169a90fe764",
	 *       "informations": {
	 *         "content": "d13a32829c2547b8bca6da5bb568d3",
	 *         "authTag": "db47515bdcb7643484d60189b7ad4e33"
	 *       }
	 *     }
	 *   }
	 */

	/**
	 * @apiDefine ResponseLineComplete
	 *
	 * @apiSuccess {String} _id Id of the line
	 * @apiSuccess {String} type type of line
	 * @apiSuccess {String} label label of the line
	 * @apiSuccess {Object} encryption Informations used for encrypted data
	 * @apiSuccess {Object} encryption.informations Encrypted informations
	 * @apiSuccess {String} encryption.informations.content Encrypted content of the line
	 * @apiSuccess {String} encryption.informations.authTag Authentification tag of the encrypted informations
	 * @apiSuccess {String} encryption.salt Salt used to encrypt informations
	 *
	 *
	 * @apiSuccessExample {json} Success text:
	 *   HTTP/1.1 200 OK
	 *     {
	 *       "_id": "57685936f4495bc62c4d28a3",
	 *       "type": "text",
	 *       "label": "My custom text",
	 *       "encryption": {
	 *         "salt": "83b01169a90fe764",
	 *         "informations": {
	 *           "content": "d13a32829c2547b8bca6da5bb568d3",
	 *           "authTag": "db47515bdcb7643484d60189b7ad4e33"
	 *         }
	 *       }
	 *     }
	 */

	router.route('')
	/**
	 * @api {get} /api/lines Request all lines
	 *
	 * @apiDescription Request the list of lines from the connected users. Only the _id, type, and label of the line is
	 * given. No encrypted information are send in this method.
	 *
	 * @apiName GetLines
	 * @apiGroup Line
	 * @apiPermission ROLE_USER
	 *
	 * @apiSuccess {String} _id Id of the line
	 * @apiSuccess {String} type type of line
	 * @apiSuccess {String} label label of the line
	 *
	 * @apiSuccessExample Success:
	 *     HTTP/1.1 200 OK
	 *     [
	 *       {
	 *         "_id": "57685936f4495bc62c4d28a3",
	 *         "type": "card",
	 *         "label": "My credit card"
	 *       },
	 *       {
	 *         "_id": "57685936f4495bc62c4d28a4",
	 *         "type": "password",
	 *         "label": "My password"
	 *       },
	 *     ]
	 *
	 * @apiError Unauthorized Only the connected user can access to list of lines
	 * @apiError Forbidden Your are not allowed to access to this API
	 *
	 * @apiErrorExample {json} Unauthorized:
	 *     HTTP/1.1 401 Unauthorized
	 *
	 * @apiErrorExample {json} Forbidden:
	 *     HTTP/1.1 403 Forbidden
	 */
		.get((req, res) => {
			const offset = parseInt(req.query.offset || 0);
			const limit = parseInt(req.query.limit || 10);

			return services.line.getLines(req.user, {offset, limit}).map(filterLine).then(res.json.bind(res));
		})

		/**
		 * @api {post} /api/lines Create new line
		 * @apiName PostLines
		 * @apiGroup Line
		 * @apiPermission ROLE_USER
		 *
		 * @apiUse UpdateLine
		 * @apiUse ResponseLineComplete
		 *
		 * @apiError Unauthorized Only the connected user can access to list of lines
		 *
		 * @apiErrorExample {json} Unauthorized:
		 *     HTTP/1.1 401 Unauthorized
		 */
		.post((req, res) => {
			const data = _.pick(req.body, 'type', 'label', 'encryption');

			return saveLine(data, req, res);
		});

	router.param('lineId', (req, res, next, lineId) => {
		services.line.getLine(lineId, req.user).then(line => {
			// Can't access or update lines that isn't associated to the account of the user
			if (line.user !== req.user._id) {
				const notAuthorizedError = new Error('Not authorized to access to thhis subscriptions');
				notAuthorizedError.status = 403;
				return Promise.reject(notAuthorizedError);
			}

			req.line = line;
			return next();
		}).catch(next);
	});

	/**
	 * @api {get} /api/lines/:lineId Request line
	 * @apiName GetLine
	 * @apiGroup Line
	 * @apiPermission ROLE_USER
	 *
	 * @apiParam {String} lineId The id of the line
	 *
	 * @apiUse ResponseLineComplete
	 *
	 * @apiError Unauthorized Only the connected user can access to list of lines
	 * @apiError Forbidden Your are not allowed to access to this API
	 *
	 * @apiErrorExample {json} Unauthorized:
	 *     HTTP/1.1 401 Unauthorized
	 *
	 * @apiErrorExample {json} Forbidden:
	 *     HTTP/1.1 403 Forbidden
	 */
	router.route('/:lineId')
		.get((req, res) => res.json(filterLine(req.line)))
		/**
		 * @api {put} /api/lines/:lineId Update the line
		 * @apiName PutLine
		 * @apiGroup Line
		 * @apiPermission ROLE_USER
		 *
		 * @apiUse UpdateLine
		 * @apiUse ResponseLineComplete
		 */
		.put((req, res) => {
			const data = _.pick(req.body, 'type', 'label', 'encryption');

			// Force the id of the line to ensure that the user doesn't try to change it
			data._id = req.line._id;

			return saveLine(data, req, res);
		})
		/**
	 	 * @api {delete} /api/lines/:lineId Delete the line
		 * @apiName DeleteLine
		 * @apiGroup Line
		 * @apiPermission ROLE_USER
		 *
		 * @apiSuccessExample {json} Success-Response:
		 *     HTTP/1.1 204 OK
	 	 */
		.delete((req, res) => {
			return services.line.removeLine(req.line._id).then(function() {
				res.status(204).send();
			});
		});

	app.use('/api/lines', authenticate(), permission(), router);

	/**
	 * Filter information that the user is authorized to view in the response
	 * @param {Object} line The response
	 * @returns {Object} The filtered object.
	 */
	function filterLine(line) {
		return _.pick(line, '_id', 'type', 'label', 'encryption');
	}

	/**
	 * Create or modify a line given by the request.
	 * @param {Object} data Object to create or modify
	 * @param {Object} req Request use to read the user
	 * @param {Object} res Response used to send the response.
	 * @returns {Promise} Promise that the line will be saved.
	 */
	function saveLine(data, req, res) {
		// Force the user stored in the line.
		data.user = req.user._id;

		const validationError = new Error();
		validationError.status = 400;

		const typeChoices = ['card', 'password', 'text'];
		if (!_.contains(typeChoices, data.type)) {
			validationError.message = i18n.t('error:line.400.type', {choices: typeChoices.join(', ')});
			return Promise.reject(validationError);
		}

		if (!_.isString(data.label) || _.isEmpty(data.label)) {
			validationError.message = i18n.t('error:line.400.label');
			return Promise.reject(validationError);
		}

		return services.line.saveLine(data, req.user).then(function (line) {
			res.json(filterLine(line));
		});
	}
};
