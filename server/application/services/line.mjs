'use strict';

import debug from 'debug';
import {NotFoundError} from '../models/exception';
import {getLines as getLinesModel, getLine as getLineModel, saveLine as saveLineModel, removeLine as removeLineModel} from '../models/line';
import {createTransaction} from '../services/transaction';

const log = debug('App:Service:Line');

export function getLines(user) {
	log('Get all lines from user ', user._id);

	const filter = {};
	filter.user = user._id;

	const sort = {};
	sort.group = 1;
	sort.label = 1;

	return getLinesModel(filter, sort);
}

export function getLine(id) {
	log(`Get the line with id ${id}`);
	return getLineModel(id);
}

export function saveLine(line) {
	log(`Create the line of type ${line.type}`);

	line.updatedAt = new Date();

	return getLineIfAvailable(line._id, line._rev)
		.then(function (oldLine) {
			return saveLineModel(line).tap(newLine => createTransaction('line', oldLine, newLine));
		});
}

export function removeLine(id) {
	log(`Remove the line with the id ${id}`);

	return getLineIfAvailable(id)
		.tap(() => removeLineModel(id))
		.tap(oldLine => createTransaction('line', oldLine));
}

function getLineIfAvailable(id, rev) {
	return getLineModel(id, rev).catch(NotFoundError, () => null);
}
