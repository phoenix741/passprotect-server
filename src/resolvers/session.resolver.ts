import { BadRequestException, UseGuards, Injectable } from '@nestjs/common';
import { Mutation, Args, Query } from '@nestjs/graphql';
import { SessionsService } from '../session/sessions.service';
import { toFunctionalError } from '../shared/models/functional-error';
import { GqlAuthGuard } from '../session/guard/gql-auth.guard';
import { isString } from '../shared/utils/lodash';
import { UserContext } from '../session/guard/user-context.decorator';
import { User } from '../users/dto/user.dto';
import { ConnectionInformationInput } from '../session/dto/connection-information-input.dto';
import { CreateSessionResultUnion, CreateSessionResult } from '../session/dto/create-session-result-union.dto';

@Injectable()
export class SessionResolver {
  constructor(private readonly sessionService: SessionsService) {}

  @Query(returns => User, { description: 'Request the current session' })
  @UseGuards(GqlAuthGuard)
  session(@UserContext() user: User): User {
    return user;
  }

  @Mutation(returns => CreateSessionResultUnion, {
    description: 'Create a new session, return the authorization token',
  })
  async createSession(@Args('input') input: ConnectionInformationInput): Promise<CreateSessionResult> {
    try {
      check(input);
      const { jwtToken, user } = await this.sessionService.signIn(input.username, input.password);
      return { token: 'bearer ' + jwtToken, user };
    } catch (err) {
      return toFunctionalError(err).toGraphQL('username');
    }
  }
}

function check(data: ConnectionInformationInput) {
  if (!isString(data.username)) {
    throw new BadRequestException('error.user.401.username');
  }

  if (!isString(data.password) || data.password.length < 8) {
    throw new BadRequestException('error.user.401.password');
  }
}
