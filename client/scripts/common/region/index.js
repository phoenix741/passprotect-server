'use strict';

import {Session} from '../entities/session';

class AnalyticsRegion extends Marionette.Region {
	onShow(view) {
		this.trackPage(view);
	}

	startTracking() {
		if (__PIWIK_ENABLED__) {
			this.startGenerationTimeMs = (new Date()).getTime();
			this.fetchingSession = Session.getSession();
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

			this.fetchingSession.then(session => this.trackPageView(url, title, session.get('user'), timeMs));
		}
	}

	trackPageView(url, title, user, generationTimeMs, keywords, count) {
		if (__PIWIK_ENABLED__) {
			window._paq = window._paq || [];

			_paq.push(['setCustomUrl', url]);
			title && _paq.push(['setDocumentTitle', title]);
			generationTimeMs && _paq.push(['setGenerationTimeMs', generationTimeMs]);
			user && _paq.push(['setUserId', user.get('_id')]);

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
	attachHtml(view) {
		this.$el.hide();
		this.$el.html(view.el);
		this.$el.fadeIn('fast');
	}
}

export class DialogRegion extends AnalyticsRegion {
	onShow(view) {
		super.onShow(view);

		this.listenTo(view, 'dialog:close', this.closeDialog);

		this.$el.openModal({
			complete: () => {
				this.closeDialog();
			}
		});
	}

	closeDialog() {
		this.stopListening();
		this.empty();
		this.$el.closeModal();
	}
}

export class FullscreenDialogRegion extends AnalyticsRegion {
	constructor(application, options) {
		super(options);

		this.application = application;
	}

	onShow(view) {
		super.onShow(view);

		// On show we hide the header, body and footer.
		this.application.headerRegion.$el.hide();
		this.application.bodyRegion.$el.hide();

		this.listenTo(view, 'dialog:close', this.closeDialog);
	}

	onEmpty(view) {
		// On empty we restore all views.
		this.application.headerRegion.$el.show();
		this.application.bodyRegion.$el.show();
	}

	closeDialog() {
		this.stopListening();
		this.empty();
	}
}

export function addRegions(application) {
	// Add Regions
	application.addRegions({
		headerRegion: '#content-header',
		bodyRegion: new BodyRegion({el: '#content-body'}),
		dialogRegion: new FullscreenDialogRegion(application, {el: '#content-dialog'}),
		errorDialogRegion: new DialogRegion({el: '#error-dialog'})
	});
}

