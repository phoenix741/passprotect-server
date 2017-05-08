'use strict';

import {property} from 'nsclient/common/decorators';
import template from 'nscommon/templates/common/missing.pug';

export default class MissingPageView extends Marionette.View {
	@property
	static template = template
}
