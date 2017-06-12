'use strict';

import debug from 'debug';
import {getGroups as getGroupsModel} from 'server/models/group';

const log = debug('App:Service:Group');

export function getGroups(user) {
	log('Get all groups from user ', user._id);

	const filter = {};
	filter.user = user._id;

	const sort = {};
	sort.group = 1;

	return getGroupsModel(filter, sort);
}
