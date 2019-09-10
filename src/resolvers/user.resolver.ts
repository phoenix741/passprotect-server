import { UseGuards } from '@nestjs/common';
import { Resolver, Args, Query, ResolveProperty, Parent, Mutation } from '@nestjs/graphql';
import { UsersService } from '../users/users.service';
import { AuthorizationService } from '../shared/services/authorization.service';
import { GqlAuthGuard } from '../session/guard/gql-auth.guard';
import { LinesService } from '../lines/lines.service';
import { toFunctionalError } from '../shared/models/functional-error';
import { RegistrationUserInput } from '../users/dto/registration-user.dto';
import { User } from '../users/dto/user.dto';
import { RegisterUserResultUnion } from '../users/dto/register-user-result.dto';
import { UserContext } from '../session/guard/user-context.decorator';

@Resolver(of => User)
export class UserResolver {
  constructor(
    private readonly userService: UsersService,
    private readonly lineService: LinesService,
    private readonly authorizationService: AuthorizationService,
  ) {}

  @Query(returns => User, { description: 'Request a user' })
  @UseGuards(GqlAuthGuard)
  async user(@Args('id') id: string, @UserContext() user: User): Promise<User> {
    this.authorizationService.checkPermission(user, id);
    return await this.userService.findById(id);
  }

  @ResolveProperty()
  @UseGuards(GqlAuthGuard)
  async lines(@Parent() parentUser: User, @UserContext() user: User) {
    this.authorizationService.checkPermission(user, parentUser._id);
    return await this.lineService.findAll(parentUser._id);
  }

  @Mutation(returns => RegisterUserResultUnion, {
    description: 'Register a new user',
  })
  async registerUser(@Args('input') input: RegistrationUserInput): Promise<typeof RegisterUserResultUnion> {
    try {
      return await this.userService.registerUser(input);
    } catch (err) {
      return toFunctionalError(err).toGraphQL('username');
    }
  }
}
