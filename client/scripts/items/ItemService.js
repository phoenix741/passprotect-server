'use strict';

import {SESSION} from '../user/UserService';
import {createKeyDerivation, decrypt, encrypt, generateIV} from 'nsclient/utils/crypto';
import {parseErrors} from 'nsclient/utils/errors';
import {merge, find, remove} from 'lodash';
import createUpdateLine from './createUpdateLine.gql';
import removeLineQuery from './removeLine.gql';
import getLines from './getLines.gql';
import getLinesWithDetail from './getLinesWithDetail.gql';
import downloadAsFile from 'download-as-file';

const config = __PASSPROTECT_CONFIG__.crypto;

export const cardTypeMapping = {
	card: {
		label: 'items:list.type.card',
		icon: 'credit_card',
		color: 'red',
		fields: {
			type: '',
			nameOnCard: '',
			cardNumber: '',
			cvv: '',
			expiry: '',
			code: '',
			notes: ''
		}
	},
	password: {
		label: 'items:list.type.password',
		icon: 'fingerprint',
		color: 'blue',
		fields: {
			username: '',
			password: '',
			siteUrl: '',
			notes: ''
		}
	},
	text: {
		label: 'items:list.type.text',
		icon: 'text_fields',
		color: 'green',
		fields: {
			text: '',
			notes: ''
		}
	}
};

export function updateLine(context, line) {
	return context.$apollo
		.mutate({
			mutation: createUpdateLine,
			variables: {
				input: line
			},
			update(store, { data: { createUpdateLine } }) {
				const data = store.readQuery({ query: getLines });
				if (!find(data.lines, line => line._id === createUpdateLine._id)) {
					data.lines.push(createUpdateLine);
					store.writeQuery({ query: getLines, data });
				}
			},
			optimisticResponse: {
				__typename: 'Mutation',
				createUpdateLine: merge(
					{
						__typename: 'WalletLine',
						updatedAt: (new Date()).getTime(),
						encryption: {
							__typename: 'EncryptedWalletLine',
							informations: {
								__typename: 'EncryptedContent'
							}
						}
					},
					line
				)
			}
		})
		.tap(result => parseErrors(result.data.createUpdateLine))
		.catch(err => (context.error = err));
}

export function removeLine(context, lineId) {
	return context.$apollo
		.mutate({
			mutation: removeLineQuery,
			variables: {
				id: lineId
			},
			update(store, { data: { removeLine } }) {
				const data = store.readQuery({ query: getLines });
				if (! removeLine.errors || !removeLine.errors.length) {
					remove(data.lines, line => line._id === lineId);
					store.writeQuery({ query: getLines, data });
				}
			},
			optimisticResponse: {
				__typename: 'Mutation',
				removeLine: {
					__typename: 'Errors',
					errors: []
				}
			}
		})
		.tap(result => parseErrors(result.data.removeLineQuery))
		.catch(err => (context.error = err));
}

export function encryptLine(clearInformation) {
	const informationsString = JSON.stringify(clearInformation);

	const generateSaltPromise = generateIV(config.ivSize);
	const generateLineKeyPromise = generateSaltPromise.then(salt => createKeyDerivation(SESSION.clearKey, salt, config.pbkdf2));

	return Promise
		.props({salt: generateSaltPromise, lineKey: generateLineKeyPromise})
		.then(props => {
			return encrypt(new Buffer(informationsString, 'utf-8'), props.lineKey.key, props.lineKey.iv, config.cypherIv)
				.then(informationEncrypted => ({salt: props.salt, informations: informationEncrypted}));
		});
}

export function decryptLine(line) {
	if (! line.encryption || !line.encryption.informations) {
		return Promise.resolve(completeFields(line.type, {}));
	}

	const salt = line.encryption.salt;
	const informationsEncrypted = line.encryption.informations;

	const generateLineKeyPromise = createKeyDerivation(SESSION.clearKey, salt, config.pbkdf2);

	return generateLineKeyPromise
		.then(lineKey => decrypt(informationsEncrypted, lineKey.key, lineKey.iv, config.cypherIv))
		.then(informationString => JSON.parse(informationString))
		.then(clearInformation => completeFields(line.type, clearInformation));
}

export function generatePasswordFile(context) {
	context.$apollo.addSmartQuery('lines', {
		query: getLinesWithDetail,
		result({data}) {
			Promise
				.filter(data.lines, line => line.type === 'password')
				.map(line => {
					return decryptLine(line).then(function(decryptedContent) {
						return line.label + '\t\t' + decryptedContent.siteUrl + '\t\t' + decryptedContent.username + '\t\t' + decryptedContent.password;
					});
				})
				.then(function(data) {
					downloadAsFile({
						data: data.join('\n'),
						filename: 'password.txt'
					});
				});

			setTimeout(() => context.$apollo.queries.lines.stop());
		}
	});
}

function completeFields(type, clearInformation) {
	const fields = cardTypeMapping[type].fields;
	return merge({}, fields, clearInformation);
}
