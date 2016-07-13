'use strict';

import {property} from 'nsclient/common/decorators';
import 'backbone-deep-model/distribution/deep-model.min';

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

	static fetchItem(_id) {
		const item = new Item({_id});
		return item.fetch();
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
