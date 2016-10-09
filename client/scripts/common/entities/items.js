'use strict';

import {property} from 'nsclient/common/decorators';
import 'backbone-deep-model/distribution/deep-model.min';
import {createKeyDerivation, decrypt, encrypt, generateIV, generateKey} from 'nscommon/services/crypto';

const config = __PASSPROTECT_CONFIG__.crypto;

const cardTypeMapping = {
	card: {
		label: 'items:list.type.card',
		icon: 'credit_card',
		color: 'red'
	},
	password: {
		label: 'items:list.type.password',
		icon: 'fingerprint',
		color: 'blue'
	},
	text: {
		label: 'items:list.type.text',
		icon: 'text_fields',
		color: 'green'
	}
};

export class Item extends Backbone.DeepModel {
	@property
	static urlRoot = '/api/lines';

	@property
	static idAttribute = '_id';

	@property
	static validation = {
		_id: {
			required: true,
			msg: 'error:item.400._id'
		},
		type: {
			require: true,
			pattern: /(card|password|text)/,
			msg: 'error:item.400.type'
		},
		label: {
			require: true,
			msg: 'error:item.400.label'
		}
	};

	get cardType() {
		return i18n.t(cardTypeMapping[this.get('type')].label);
	}

	get cardIcon() {
		return cardTypeMapping[this.get('type')].icon;
	}

	get cardColor() {
		return cardTypeMapping[this.get('type')].color;
	}

	_load(key) {
		const salt = this.get('encryption.salt');
		const informationsEncrypted = this.get('encryption.informations');

		const generateLineKeyPromise = createKeyDerivation(key, salt, config.pbkdf2);

		return generateLineKeyPromise
			.then(lineKey => decrypt(informationsEncrypted, lineKey.key, lineKey.iv, config.cypherIv))
			.then(informationString => this.set('informations', JSON.parse(informationString)));
	}

	encryptAndSave(key) {
		const model = this;
		const informations = this.get('informations');
		const informationsString = JSON.stringify(informations);

		const generateSaltPromise = generateIV(config.ivSize);
		const generateLineKeyPromise = generateSaltPromise.then(salt => createKeyDerivation(key, salt, config.pbkdf2));

		return Promise.props({
			salt: generateSaltPromise,
			lineKey: generateLineKeyPromise
		}).then(props => {
			return encrypt(new Buffer(informationsString, 'utf-8'), props.lineKey.key, props.lineKey.iv, config.cypherIv).then(function (informationEncrypted) {
				model.set('encryption', {
					salt: props.salt,
					informations: informationEncrypted
				});

				return model.save();
			});
		});
	}

	toJSON(options) {
		var attr = _.clone(this.attributes);
		delete attr.informations;
		return attr;
	}

	static fetchItem(_id, key) {
		const item = new Item({_id});
		return item.fetch().then(() => item._load(key));
	}
}

export class Items extends Backbone.Collection {
	@property
	static url = '/api/lines';

	@property
	static model = Item

	static fetchItems() {
		const items = new Items();
		return items.fetch();
	}
}
