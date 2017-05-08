'use strict';

import {SessionStorage} from 'nsclient/common/entities/session';
import {property} from 'nsclient/common/decorators';
import rootViewTemplate from 'nscommon/templates/rootView.pug';

class AnalyticsRegion extends Marionette.Region {
	constructor(application, options) {
		super(options);

		this.application = application;
	}

	onShow(region, view) {
		this.trackPage(view);
	}

	startTracking() {
		if (__PIWIK_ENABLED__) {
			this.startGenerationTimeMs = (new Date()).getTime();
		}
		this.currentTitle = null;
	}

	trackPage(view) {
		// Try to get the title stored on the view
		const titleElement = view.$el.find('.main-title');
		if (titleElement) {
			this.currentTitle = titleElement.text();
		}

		document.title = this.currentTitle;

		if (__PIWIK_ENABLED__) {
			let timeMs = null;
			if (this.startGenerationTimeMs) {
				timeMs = (new Date()).getTime() - this.startGenerationTimeMs;
			}

			const url = Backbone.history.getFragment();
			const title = this.currentTitle;

			this.trackPageView(url, title, this.application.getSession().get('username'), timeMs);
		}
	}

	trackPageView(url, title, user, generationTimeMs, keywords, count) {
		if (__PIWIK_ENABLED__) {
			window._paq = window._paq || [];

			_paq.push(['setCustomUrl', url]);
			title && _paq.push(['setDocumentTitle', title]);
			generationTimeMs && _paq.push(['setGenerationTimeMs', generationTimeMs]);
			user && _paq.push(['setUserId', user]);

			_paq.push(['enableLinkTracking']);

			if (keywords) {
				_paq.push(['trackSiteSearch', keywords, null, count]);
			}
			else {
				_paq.push(['trackPageView']);
			}
		}
	}
}

export class BodyRegion extends AnalyticsRegion {
	constructor(application, rootView, options) {
		super(application, options);

		this.rootView = rootView;
	}

	attachHtml(view) {
		this.$el.hide();
		this.$el.html(view.el);
		this.$el.fadeIn('fast');
	}
}

export class DialogRegion extends AnalyticsRegion {
	constructor(application, rootView, options) {
		super(application, options);

		this.rootView = rootView;
	}

	onShow(region, view) {
		super.onShow(region, view);

		this.listenTo(view, 'dialog:close', this.closeDialog);

		this.$el.modal({
			complete: () => {
				this.closeDialog();
			}
		});
		this.$el.modal('open');
	}

	closeDialog() {
		this.stopListening();
		this.empty();
	}
}

export class FullscreenDialogRegion extends AnalyticsRegion {
	constructor(application, rootView, options) {
		super(application, options);

		this.rootView = rootView;
	}

	onShow(region, view) {
		super.onShow(region, view);

		// On show we hide the header, body and footer.
		this.rootView.getRegion('headerRegion').$el.hide();
		this.rootView.getRegion('bodyRegion').$el.hide();

		this.listenTo(view, 'dialog:close', this.closeDialog);
	}

	onEmpty(view) {
		// On empty we restore all views.
		this.rootView.getRegion('headerRegion').$el.show();
		this.rootView.getRegion('bodyRegion').$el.show();
	}

	closeDialog() {
		this.stopListening();
		this.empty();
	}
}

export class RootView extends Marionette.View {
	@property
	static template = rootViewTemplate;

	constructor(application, options) {
		super(_.extend({}, options, {
			application
		}));
	}

	regions() {
		return {
			headerRegion: '#content-header',
			bodyRegion: new BodyRegion(this.options.application, this, {el: '#content-body'}),
			dialogRegion: new FullscreenDialogRegion(this.options.application, this, {el: '#content-dialog'}),
			errorDialogRegion: new DialogRegion(this.options.application, this, {el: '#error-dialog'})
		};
	}
}

class ProjectApplication extends Marionette.Application {
	@property
	static region = 'body';

	initialize() {
		this.session = new SessionStorage();
		return this.session.fetch();
	}

	getCurrentRoute() {
		return Backbone.history.fragment;
	}

	navigate(route, options) {
		options = options || {};
		Backbone.history.navigate(route, options);
	}

	getSession() {
		return this.session;
	}

	onStart() {
		this.showView(new RootView(this));
	}
}

export default new ProjectApplication();
