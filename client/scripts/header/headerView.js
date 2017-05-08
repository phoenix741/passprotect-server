'use strict';

import templateHeader from 'nscommon/templates/common/header.pug';
import templateHeaderGroupLinkTemplate from './templates/headerGroupLinkTemplate.ejs';
import templateHeaderGroupMenuTemplate from './templates/headerGroupMenuTemplate.ejs';
import templateHeaderMobileGroupLinkTemplate from './templates/headerMobileGroupLinkTemplate.ejs';
import templateHeaderMobileGroupMenuTemplate from './templates/headerMobileGroupMenuTemplate.ejs';
import {property} from 'nsclient/common/decorators';

export class HeaderLayout extends Marionette.View {
	@property
	static template = templateHeader;

	@property
	static tagName = 'nav';

	@property
	static triggers = {
		'click a.brand-logo': 'brand:clicked'
	};

	@property
	static regions = {
		menu: '#navigation-large',
		menuMobile: '#navigation-mobile'
	};
}

export class HeaderGroupLink extends Marionette.View {
	@property
	static template = templateHeaderGroupLinkTemplate;

	@property
	static tagName = 'li';

	@property
	static events = {
		'click a': 'navigate'
	};

	navigate(e) {
		e.preventDefault();
		this.trigger('navigate', this.model);
	}

	onRender() {
		if (!this.model.get('url')) {
			this.$el.addClass('divider');
		}
	}
}

export class HeaderGroupMenu extends Marionette.CompositeView {
	@property
	static template = templateHeaderGroupMenuTemplate;

	@property
	static childView = HeaderGroupLink;

	@property
	static childViewContainer = 'ul';

	@property
	static tagName = 'li';

	templateContext() {
		return {
			index: this.index
		};
	}

	initialize(options) {
		this.index = this.model.get('itemId');
		this.collection = this.model.get('collection');
	}

	render() {
		this.$el.find('.dropdown-button').dropdown();
	}
}

export class HeaderMenu extends Marionette.CollectionView {
	@property
	static tagName = 'ul';

	childView(item) {
		if (item.get('collection')) {
			return HeaderGroupMenu;
		}
		else {
			return HeaderGroupLink;
		}
	}

	childViewOptions(model, index) {
		return {
			childIndex: index
		};
	}
}

export class HeaderMobileGroupLink extends Marionette.View {
	@property
	static template = templateHeaderMobileGroupLinkTemplate;

	@property
	static tagName = 'li';

	@property
	static events = {
		'click a': 'navigate'
	};

	navigate(e) {
		e.preventDefault();
		this.trigger('navigate', this.model);
	}

	onRender() {
		if (!this.model.get('url')) {
			this.$el.addClass('divider');
		}
	}
}

export class HeaderMobileGroupMenu extends Marionette.CompositeView {
	@property
	static childView = HeaderMobileGroupLink;

	@property
	static childViewContainer = '.collapsible-body ul';

	@property
	static template = templateHeaderMobileGroupMenuTemplate;

	@property
	static tagName = 'li';

	initialize(options) {
		this.collection = this.model.get('collection');
	}

	filter(item) {
		return item.get('url');
	}

	render() {
		this.$el.find('.collapsible').collapsible();
	}
}

export class HeaderMobileMenu extends HeaderMenu {
	getChildView(item) {
		if (item.get('collection')) {
			return HeaderMobileGroupMenu;
		}
		else {
			return HeaderMobileGroupLink;
		}
	}

	childViewOptions(model, index) {
		return {
			className: model.get('collection') ? 'no-padding' : 'bold'
		};
	}

	render() {
		this.$el.parent().parent().find('.button-collapse').sideNav({
			menuWidth: 300,
			closeOnClick: true
		});
	}
}
