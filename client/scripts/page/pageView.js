'use strict';

import aboutTemplate from 'nscommon/templates/common/about.jade';
import {property} from 'nsclient/common/decorators';

export class AboutView extends Marionette.ItemView {
	@property
	static template = aboutTemplate;
}
