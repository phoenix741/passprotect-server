import { Resolver, ResolveProperty, Mutation, Parent, Context, Args, Query } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '../session/guard/gql-auth.guard';
import { LineEntity } from '../lines/models/line.entity';
import { UserEntity } from '../users/models/user.entity';
import { UsersService } from '../users/users.service';
import { LinesService } from '../lines/lines.service';
import { AuthorizationService } from '../shared/services/authorization.service';
import { ObjectID } from 'bson';
import { toFunctionalError, FunctionalError } from '../shared/models/functional-error';
import { WalletLine } from '../lines/dto/wallet-line.dto';
import { WalletLineUpdateInput } from '../lines/dto/wallet-line-update-input.dto';
import { WalletLineCreateInput } from '../lines/dto/wallet-line-create-input.dto';
import { UpdateLineResultUnion, UpdateLineResult } from '../lines/dto/update-line-result.dto';
import { Errors } from '../shared/dto/errors.dto';
import { User as UserDto } from '../users/dto/user.dto';
import { UserContext } from '../session/guard/user-context.decorator';

@Resolver(of => WalletLine)
@UseGuards(GqlAuthGuard)
export class LineResolver {
  constructor(
    private readonly userService: UsersService,
    private readonly lineService: LinesService,
    private readonly authorizationService: AuthorizationService,
  ) {}

  @ResolveProperty('user', returns => UserDto, {
    description: 'Owner of the list',
  })
  async user(@Parent() line: LineEntity, @UserContext() user: UserEntity): Promise<UserDto> {
    this.authorizationService.checkPermission(user, line.user);
    return await this.userService.findById(line.user);
  }

  @Query(type => [WalletLine], {
    description: 'Request the list of lines from the connected users.',
  })
  async lines(@UserContext() user: UserEntity): Promise<WalletLine[]> {
    this.authorizationService.checkPermission(user);
    return (await this.lineService.findAll(user._id)).map(exposeWalletLine);
  }

  @Query(type => WalletLine, { description: 'Request a wallet line' })
  async line(@Args('id') id: string, @UserContext() user: UserEntity): Promise<WalletLine> {
    this.authorizationService.checkPermission(user);
    const line = await this.lineService.findById(new ObjectID(id));
    this.authorizationService.checkPermission(user, line.user);
    return exposeWalletLine(line);
  }

  @Query(type => [String], {
    description: 'Request all groups available on lines',
  })
  async groups(@UserContext() user: UserEntity): Promise<string[]> {
    this.authorizationService.checkPermission(user);
    return this.lineService.getGroups(user._id);
  }

  @Mutation(returns => UpdateLineResultUnion, {
    description: 'Create or Update a WalletLine',
  })
  async createLine(@Args('input') input: WalletLineCreateInput, @UserContext() user: UserEntity): Promise<UpdateLineResult> {
    this.authorizationService.checkPermission(user);
    try {
      const data = Object.assign({ user: user._id }, input);
      return await this.lineService.createLine(data);
    } catch (err) {
      return toFunctionalError(err).toGraphQL('label');
    }
  }

  @Mutation(returns => UpdateLineResultUnion, {
    description: 'Create or Update a WalletLine',
  })
  async updateLine(@Args('input') input: WalletLineUpdateInput, @UserContext() user: UserEntity): Promise<UpdateLineResult> {
    this.authorizationService.checkPermission(user);
    try {
      const line = await this.lineService.findById(new ObjectID(input._id));
      if (!line) {
        throw new FunctionalError('_id', 'error:line.404.lineNotFound');
      }
      this.authorizationService.checkPermission(user, line.user);

      return await this.lineService.updateLine(line, input);
    } catch (err) {
      return toFunctionalError(err).toGraphQL('label');
    }
  }

  @Mutation(returns => Errors, { description: 'Remove the line' })
  async removeLine(@Args('id') id: string, @UserContext() user: UserEntity): Promise<Errors> {
    this.authorizationService.checkPermission(user);
    try {
      const line = await this.lineService.findById(new ObjectID(id));
      if (!line) {
        throw new FunctionalError('_id', 'error:line.404.lineNotFound');
      }
      this.authorizationService.checkPermission(user, line.user);

      await this.lineService.removeLine(new ObjectID(id));
      return { errors: [] };
    } catch (err) {
      return toFunctionalError(err).toGraphQL('label');
    }
  }
}

export function exposeWalletLine(line: LineEntity): WalletLine {
  return Object.assign({}, line.toObject ? line.toObject() : line, {
    _id: line._id,
    type: line.type.toString(),
  });
}
