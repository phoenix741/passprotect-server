const config = require('config');

var piwikEnable = process.env.PIWIK_ENABLED;
if (piwikEnable === undefined) {
	piwikEnable = true;
}
const piwikSiteUrl = process.env.PIWIK_SITE_URL || '//stats.shadoware.org/';
const piwikSiteId = process.env.PIWIK_SITE_ID || 36;

module.exports = {
  '__PIWIK_ENABLED__': piwikEnable,
  '__PASSPROTECT_CONFIG__': JSON.stringify(config.get('config.client'))
};
