'use strict';

import itemsTemplate from 'nscommon/templates/items/items.pug';
import itemTemplate from 'nscommon/templates/items/item.pug';
import itemDetailTemplate from 'nscommon/templates/items/itemDetail.pug';
import paymentCardInformationsTemplate from 'nscommon/templates/items/paymentCardInformations.pug';
import passwordInformationsTemplate from 'nscommon/templates/items/passwordInformations.pug';
import textInformationsTemplate from 'nscommon/templates/items/textInformations.pug';
import removeConfirmTemplate from 'nscommon/templates/items/itemRemove.pug';

import {property} from 'nsclient/common/decorators';
import {StickitView,MaterializeForm,FormView} from 'nsclient/common/behaviors';

class ItemView extends Marionette.View {
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
	static events = {
		'click': 'onItemDetailClick'
	};

	@property
	static behaviors = [StickitView];

	@property
	static ui = {
		deleteBtn: '.delete'
	};

	onItemDetailClick(e) {
		e.preventDefault();

		const args = {
			view: this,
			model: this.model,
			collection: this.collection
		};

		if ($.contains(this.ui.deleteBtn.get(0), e.target)) {
			this.trigger('item:remove', args);
		}
		else {
			this.trigger('item:detail', args);
		}
	}
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

export class ItemDetailView extends Marionette.View {
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
	static behaviors = [FormView, MaterializeForm];

	@property
	static regions = {
		informations: '.informations'
	};

	onRender() {
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
		this.showChildView('informations', view);
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

class PaymentCardInformationsView extends Marionette.View {
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
	static behaviors = [FormView, MaterializeForm];
}

class PasswordInformationView extends Marionette.View {
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
	static behaviors = [FormView, MaterializeForm];
}

class TextInformationView extends Marionette.View {
	@property
	static template = textInformationsTemplate;

	@property
	static bindings = {
		'#text': 'informations.text',
		'#notes': 'informations.notes'
	};

	@property
	static behaviors = [FormView, MaterializeForm];
}

export class RemoveConfirmView extends Marionette.View {
	@property
	static template = removeConfirmTemplate;

	@property
	static triggers = {
		'click .agree': 'agree',
		'click .disagree': 'disagree'
	};
}
