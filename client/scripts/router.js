'use strict';

import headerRouter from './header/headerRouter';
import userRouter from './user/userRouter';
import itemsRouter from './items/itemsRouter';
import pageRouter from './page/pageRouter';

export default function(application) {
	pageRouter(application);
	userRouter(application);
	itemsRouter(application);
	headerRouter(application);
}
