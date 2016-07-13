'use strict';

import {property} from 'nsclient/common/decorators';
import template from 'nscommon/templates/common/missing.jade';

export default class MissingPageView extends Marionette.ItemView {
	@property
	static template = template
}
