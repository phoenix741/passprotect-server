'use strict';

import aboutTemplate from 'nscommon/templates/common/about.pug';
import {property} from 'nsclient/common/decorators';

export class AboutView extends Marionette.View {
	@property
	static template = aboutTemplate;
}
