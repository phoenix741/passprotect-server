'use strict';

import BodyRegion from 'nsclient/common/region/body_region';
import DialogRegion from 'nsclient/common/region/dialog_region';
import FullscreenDialogRegion from 'nsclient/common/region/fullscreendialog_region';

export function addRegions(application) {
	// Add Regions
	application.addRegions({
		headerRegion: '#content-header',
		bodyRegion: new BodyRegion({el: '#content-body'}),
		dialogRegion: new FullscreenDialogRegion({el: '#content-dialog'}),
		errorDialogRegion: new DialogRegion({el: '#error-dialog'})
	});
}

