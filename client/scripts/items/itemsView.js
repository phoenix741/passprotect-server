'use strict';

import itemsTemplate from 'nscommon/templates/items/items.jade';
import itemTemplate from 'nscommon/templates/items/item.jade';
import itemDetailTemplate from 'nscommon/templates/items/itemDetail.jade';
import paymentCardInformationsTemplate from 'nscommon/templates/items/paymentCardInformations.jade';
import passwordInformationsTemplate from 'nscommon/templates/items/passwordInformations.jade';
import textInformationsTemplate from 'nscommon/templates/items/textInformations.jade';

import {property} from 'nsclient/common/decorators';
import {StickitView,MaterializeForm,FormView} from 'nsclient/common/behaviors';

class ItemView extends Marionette.ItemView {
	@property
	static tagName = 'a';

	@property
	static className = 'collection-item avatar';

	@property
	static attributes = function () {
		return {href: '#items/' + this.model.get('_id')};
	};

	@property
	static template = itemTemplate;

	@property
	static bindings = {
		'.title': 'label',
		'.description': {
			observe: 'type',
			onGet: (val, options) => options.view.model.cardType
		},
		'.circle': {
			observe: 'type',
			updateMethod: 'html',
			onGet: (val, options) => '<div class="' + options.view.model.cardColor + '">' + options.view.model.cardIcon + '</div>'
		}
	};

	@property
	static triggers = {
		'click': 'item:detail'
	};

	@property
	static behaviors = {
		'StickitView': {
			behaviorClass: StickitView
		}
	};
}

export class ItemsView extends Marionette.CompositeView {
	@property
	static className = 'container';

	@property
	static template = itemsTemplate;

	@property
	static childViewContainer = '.collection';

	@property
	static childView = ItemView;

	@property
	static triggers = {
		'click .add-credit-card': 'item:add-credit-card',
		'click .add-password': 'item:add-password',
		'click .add-text': 'item:add-text'
	};
}

export class ItemDetailView extends Marionette.LayoutView {
	@property
	static template = itemDetailTemplate;

	@property
	static triggers = {
		'click .dialog-close': 'dialog:close'
	};

	@property
	static events = {
		'click .showhide': 'showHide',
		'click .copyclp': 'copyToClipboard'
	};

	@property
	static bindings = {
		'#label': 'label',
		'.brand-logo': {
			observe: 'type',
			onGet: (val, options) => options.view.model.cardType
		}
	};

	@property
	static behaviors = {
		'MaterializeForm': {
			behaviorClass: MaterializeForm
		},
		'FormView': {
			behaviorClass: FormView
		}
	};

	@property
	static regions = {
		informations: '.informations'
	};

	onShow() {
		let view;
		switch (this.model.get('type')) {
			case 'card':
				view = new PaymentCardInformationsView({model: this.model});
				break;
			case 'password':
				view = new PasswordInformationView({model: this.model});
				break;
			case 'text':
				view = new TextInformationView({model: this.model});
				break;
		}
		this.informations.show(view);
	}

	showHide(e) {
		const target = $(e.target);
		const group = target.closest('.input-field');

		switch (target.html()) {
			case 'visibility':
				group.find('input').get(0).type = 'text';
				target.html('visibility_off');
				break;
			case 'visibility_off':
				group.find('input').get(0).type = 'password';
				target.html('visibility');
				break;
		}
	}

	copyToClipboard(e) {
		const target = $(e.target);
		const group = target.closest('.input-field');
		const value = group.find('input, textarea').val();

		var $temp = $('<input>');
		$('body').append($temp);
		$temp.val(value).select();
		document.execCommand('copy');
		$temp.remove();
	}
}

class PaymentCardInformationsView extends Marionette.ItemView {
	@property
	static template = paymentCardInformationsTemplate;

	@property
	static bindings = {
		'#type': {
			observe: 'informations.type',
			selectOptions: {
				collection: () => i18n.t('items:item.form.type.options').split('+')
			}
		},
		'#nameOnCard': 'informations.nameOnCard',
		'#cardNumber': 'informations.cardNumber',
		'#cvv': 'informations.cvv',
		'#expiry': 'informations.expiry',
		'#code': 'informations.code',
		'#notes': 'informations.notes'
	};

	@property
	static behaviors = {
		'MaterializeForm': {
			behaviorClass: MaterializeForm
		},
		'FormView': {
			behaviorClass: FormView
		}
	};
}

class PasswordInformationView extends Marionette.ItemView {
	@property
	static template = passwordInformationsTemplate;

	@property
	static bindings = {
		'#username': 'informations.username',
		'#password': 'informations.password',
		'#siteUrl': 'informations.siteUrl',
		'#notes': 'informations.notes'
	};

	@property
	static behaviors = {
		'MaterializeForm': {
			behaviorClass: MaterializeForm
		},
		'FormView': {
			behaviorClass: FormView
		}
	};
}

class TextInformationView extends Marionette.ItemView {
	@property
	static template = textInformationsTemplate;

	@property
	static bindings = {
		'#text': 'informations.text',
		'#notes': 'informations.notes'
	};

	@property
	static behaviors = {
		'MaterializeForm': {
			behaviorClass: MaterializeForm
		},
		'FormView': {
			behaviorClass: FormView
		}
	};
}
