import { UseGuards } from '@nestjs/common';
import { Resolver, Args, ResolveProperty, Parent, Mutation } from '@nestjs/graphql';
import { AuthorizationService } from '../shared/services/authorization.service';
import { GqlAuthGuard } from '../session/guard/gql-auth.guard';
import { toFunctionalError } from '../shared/models/functional-error';
import { User } from '../users/dto/user.dto';
import { UserContext } from '../session/guard/user-context.decorator';
import { RegisterDeviceResultUnion } from '../users/dto/register-device-result.dto';
import { RegistrationDeviceInput } from '../users/dto/registration-device.dto';
import { FingerprintContext } from '../session/guard/fingerprint.decorator';
import { RemoveDeviceResult } from '../users/dto/remove-device-result.dto';
import { Errors } from '../shared/dto/errors.dto';
import { Device } from '../users/dto/device.dto';
import { SessionsService } from '../session/sessions.service';
import { DevicesService } from '../users/devices.service';
import { RevokeDeviceInput } from '../users/dto/revoke-device-input.dto';

@Resolver(of => User)
export class DeviceResolver {
  constructor(
    private readonly deviceService: DevicesService,
    private readonly sessionService: SessionsService,
    private readonly authorizationService: AuthorizationService,
  ) {}

  @ResolveProperty(returns => [Device], { description: 'List all the device of a user' })
  @UseGuards(GqlAuthGuard)
  async devices(@Parent() parentUser: User, @UserContext() user: User) {
    // FIXME: Est-ce possible ?
    // FIXME: this.authorizationService.checkPermission(user, parentUser._id);
    return await this.deviceService.findAll(parentUser._id);
  }

  @Mutation(returns => RegisterDeviceResultUnion, {
    description: 'Register a device for the connected user',
  })
  @UseGuards(GqlAuthGuard)
  async registerDevice(
    @Args('input') input: RegistrationDeviceInput,
    @FingerprintContext() fingerprint: string,
    @UserContext() user: User,
  ): Promise<typeof RegisterDeviceResultUnion> {
    try {
      this.authorizationService.checkPermission(user);

      const device = await this.deviceService.registerDevice(user._id, input);
      const { jwtToken } = await this.sessionService.signInWithDevice(user._id, device, fingerprint);
      return { token: jwtToken };
    } catch (err) {
      return toFunctionalError(err).toGraphQL('username');
    }
  }

  @Mutation(returns => Errors, {
    description: 'Remove a device from the list of authorized device',
  })
  @UseGuards(GqlAuthGuard)
  async revokeDevice(@Args('input') input: RevokeDeviceInput, @UserContext() user: User): Promise<RemoveDeviceResult> {
    try {
      this.authorizationService.checkPermission(user);

      await this.deviceService.removeDevice(user._id, input.id);
    } catch (err) {
      return toFunctionalError(err).toGraphQL('username');
    }
  }
}
