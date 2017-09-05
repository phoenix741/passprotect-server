import './application/utils/promise';

import express from 'express';
import path from 'path';

import bootstrap from './application/bootstrap';
import middlewares from './application/middlewares';

const app = express();

bootstrap(app.get('env'));

// all environments
app.set('port', process.env.PORT || 3000);

// view engine setup
app.set('views', path.join(__dirname, '..', 'common', 'templates'));
app.set('view engine', 'jade');

export default middlewares(app);
