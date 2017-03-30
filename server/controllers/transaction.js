'use strict';

import _ from 'lodash';
import Router from 'express-promise-router';
import i18n from 'i18next';
import {authenticate,permission,checkPermission} from 'server/utils/passport';
import {getTransactions} from 'server/services/transaction';
import moment from 'moment';
import fs from 'fs';
import path from 'path';
import debug from 'debug';

const log = debug('App:Controllers:Session');

const router = Router();
export default [authenticate(), permission(), router];

log('Load transaction type definition');
export const typeDefs = [
	fs.readFileSync(path.join(__dirname, '..', '..', 'common', 'graphql', 'transaction.graphql'), 'utf-8')
];

export const resolvers = {
	RootQuery: {
		transactions(obj, {earliestTs}, {user}) {
			const earliest = moment(earliestTs).toDate();

			return checkPermission(user).then(() => getTransactions(user, {earliest}));
		}
	}
};

router.route('')
/**
 * @api {get} /api/transactions Request all transactions
 *
 * @apiDescription Request all transactions that happen since the last synchronisation date.
 *
 * @apiName GetTransactions
 * @apiGroup Transaction
 * @apiPermission ROLE_USER
 *
 * @apiParam {Number} [offset=0] Offset for pagination
 * @apiParam {Number} [limit=10000] Limit of transactions used for pagination
 * @apiParam {Date} [earliest] Last synchronized date.
 *
 * @apiSuccess {String} _id Id of the transaction
 * @apiSuccess {String} type Type of transaction (only line)
 * @apiSuccess {String} line Id of the line that is associated to the transaction
 * @apiSuccess {String} user User of the line
 * @apiSuccess {Object} before The line before modification
 * @apiSuccess {Object} after The line after modification
 * @apiSuccess {Date} updatedAt The date of line creation, modification
 * @apiSuccess {String} sha512 A SHA-512 checksum of the line
 *
 * @apiSuccessExample Success:
 *     HTTP/1.1 200 OK
 *     [
 *       {
 *         "_id" : ObjectId("580fbb477c41a6153566f8f2"),
 *         "type": "line",
 *         "line" : ObjectId("58052a93b69faf215a733648"),
 *         "user" : "test",
 *         "before" : {
 *           "_id" : ObjectId("58052a93b69faf215a733648"),
 *           "type" : "text",
 *           "label" : "Test",
 *           "encryption" : {
 *             "salt" : "2ded4feaa99232aa",
 *             "informations" : {
 *                 "content" : "10578eef2d967ccddcd4ebfb893439",
 *                 "authTag" : "77b1d9e64bc414d92b1b3d1f0ef94790"
 *             }
 *           },
 *           "user" : "test",
 *           "updatedAt" : ISODate("2016-10-17T20:32:39.473Z"),
 *           "_rev" : 11
 *         },
 *         "after" : {
 *           "_id" : ObjectId("58052a93b69faf215a733648"),
 *           "type" : "text",
 *           "label" : "Test",
 *           "encryption" : {
 *             "salt" : "d0d386ba581a008a",
 *             "informations" : {
 *                 "content" : "6b191da26e65b3455b226706e1580c44",
 *                 "authTag" : "7de3f06563040c2587b11da7d951a58b"
 *             }
 *           },
 *           "user" : "test",
 *           "updatedAt" : ISODate("2016-10-25T20:06:31.587Z"),
 *           "_rev" : 12
 *         },
 *         "updatedAt" : ISODate("2016-10-25T20:06:31.587Z"),
 *         "sha512" : "4e0a5ae0671455e95726b90fc4b10308c50769b4e1cd50e2ff96e5b32b8847d81c004d4c768ffe2c075b551837a9c1216bb1dc8c684876320e5b48143d481cf8"
 *       }
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
		const earliest = moment(req.query.earliest).toDate();

		return getTransactions(req.user, {earliest}).then(res.json.bind(res));
	});
