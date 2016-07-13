'use strict';

import menuData from './menu.yml';

export class Header extends Backbone.Model {

}

export class HeaderCollection extends Backbone.Collection {
	model(attrs, options) {
		return new Header(attrs, options);
	}
}

export class Group extends Backbone.Model {
}

export class GroupCollection extends Backbone.Collection {
	model(attrs, options) {
		if (attrs.collection) {
			return new Group(attrs, options);
		}
		return new Header(attrs, options);
	}
}

export class Menu {
	constructor() {
		this.headers = new GroupCollection();
	}

	_parseMenuData(headers/* : GroupCollection */, menuData/* : array */, user/* : array */) {
		const model = _(menuData).chain().map(data => {
			const condition = parseCondition(data.condition, {user: user});
			if (! condition) {
				return null;
			}

			const object = _.omit(data, 'collection', 'condition');
			object.title = i18n.t(object.title);
			if (data.collection) {
				object.collection = new HeaderCollection();
				this._parseMenuData(object.collection, data.collection, user);
			}
			return object;
		}).compact().value();

		headers.reset(model);
	}

	fetchHeaders(user) {
		this._parseMenuData(this.headers, menuData, user);
		return this.headers;
	}
}

export default new Menu();

function parseCondition(condition, data) {
	if (! condition) {
		return true;
	}

	if (! condition.startsWith('return ')) {
		condition = 'return ' + condition;
	}

	const fn = new Function('data', condition); // eslint-disable-line no-new-func
	return fn(data);
}
