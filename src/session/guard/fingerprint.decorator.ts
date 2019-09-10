import { createParamDecorator } from '@nestjs/common';

export const FingerprintContext = createParamDecorator((data, [, , ctx]) => (ctx.req.fingerprint || {}).hash);
