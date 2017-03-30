'use strict';

import 'app-module-path/register';
import Promise from 'server/utils/promise';

import express from 'express';
import path from 'path';
import debug from 'debug';

import bootstrap from './server/bootstrap';
import middlewares from './server/middlewares';

const log = debug('App:Server');
const app = express();

bootstrap(app.get('env'));

// all environments
app.set('port', process.env.PORT || 3000);

// view engine setup
app.set('views', path.join(__dirname, 'common', 'templates'));
app.set('view engine', 'jade');

middlewares(app);

app.listen(app.get('port'), function () {
	log('Express server listening on port ' + app.get('port'));
});
