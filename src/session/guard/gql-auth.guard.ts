import { decode } from 'jsonwebtoken';
import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GqlExecutionContext } from '@nestjs/graphql';
import { JwtPayload } from '../../users/models/user.models';

@Injectable()
export class GqlAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    const ctx = GqlExecutionContext.create(context);
    const {
      fingerprint: { hash },
      headers: { authorization },
    } = ctx.getContext().req;
    const payload = decode(authorization.substr(7)) as JwtPayload;
    if (payload.issuer !== hash) {
      throw new UnauthorizedException(`The requester ${hash} is incompatible with the issuer ${payload.issuer}`);
    }
    return super.canActivate(context);
  }

  getRequest(context: ExecutionContext) {
    const ctx = GqlExecutionContext.create(context);
    return ctx.getContext().req;
  }
}
