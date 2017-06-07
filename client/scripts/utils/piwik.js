'use strict';

import {SESSION} from 'nsclient/user/UserService';

export default {
	created() {
		this.startTracking();
	},
	mounted() {
		this.trackPage();
	},
	methods: {
		startTracking() {
			if (__PIWIK_ENABLED__) {
				this.startGenerationTimeMs = (new Date()).getTime();
			}
		},

		trackPage() {
			document.title = this.title;

			if (__PIWIK_ENABLED__) {
				let timeMs = null;
				if (this.startGenerationTimeMs) {
					timeMs = (new Date()).getTime() - this.startGenerationTimeMs;
				}

				trackPageView(this.$route.path, document.title, SESSION.username, timeMs);
			}
		}
	}
};

function trackPageView(url, title, user, generationTimeMs, keywords, count) {
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
