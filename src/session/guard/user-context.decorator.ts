import { createParamDecorator } from '@nestjs/common';

export const UserContext = createParamDecorator((data, [, , ctx]) => ctx.req.user);
