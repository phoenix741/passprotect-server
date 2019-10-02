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
import { FingerprintContext } from '../session/guard/fingerprint.decorator';
import { CreateSessionFromRefreshTokenInput } from '../session/dto/create-session-from-refresh-token-input.dto';

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
  async createSession(@Args('input') input: ConnectionInformationInput, @FingerprintContext() fingerprint: string): Promise<CreateSessionResult> {
    try {
      const { jwtToken, user } = await this.sessionService.signIn(input.username, input.password, fingerprint);
      return { token: 'bearer ' + jwtToken, user };
    } catch (err) {
      return toFunctionalError(err).toGraphQL('username');
    }
  }

  @Mutation(returns => CreateSessionResultUnion, {
    description: 'Create a new session from a refresh token, return the authorization token',
  })
  async createSessionFromRefreshToken(
    @Args('input') input: CreateSessionFromRefreshTokenInput,
    @FingerprintContext() fingerprint: string,
  ): Promise<CreateSessionResult> {
    try {
      const { jwtToken, user } = await this.sessionService.signInFromRefreshToken(input.token, fingerprint);
      return { token: 'bearer ' + jwtToken, user };
    } catch (err) {
      return toFunctionalError(err).toGraphQL('username');
    }
  }
}
