'use strict';

import 'app-module-path/register';
import 'server/utils/promise';

import express from 'express';
import path from 'path';

import bootstrap from './server/bootstrap';
import middlewares from './server/middlewares';

const app = express();

bootstrap(app.get('env'));

// all environments
app.set('port', process.env.PORT || 3000);

// view engine setup
app.set('views', path.join(__dirname, 'common', 'templates'));
app.set('view engine', 'jade');

middlewares(app);
