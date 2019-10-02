import { JwtService } from '@nestjs/jwt';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtPayload, PayloadScopeEnum } from '../users/models/user.models';
import { UserEntity, DeviceEntity } from '../users/models/user.entity';
import { ObjectID } from 'bson';

const SESSION_TOKEN_OPTIONS = {
  expiresIn: '15m',
};

const REFRESH_TOKEN_OPTIONS = {
  expiresIn: '12w',
};

@Injectable()
export class SessionsService {
  constructor(private readonly userService: UsersService, private readonly jwtService: JwtService) {}

  async signIn(username: string, password: string, fingerprint: string): Promise<{ user: UserEntity; jwtToken: string }> {
    const user = await this.userService.findById(username);
    if (!user) {
      throw new UnauthorizedException('error.user.404.userNotFound');
    }

    await this.userService.verifyPassword(user, password);
    const jwtToken = await this.createToken(username, fingerprint);
    return { user, jwtToken };
  }

  async validateUser(payload: JwtPayload): Promise<UserEntity> {
    return await this.userService.findById(payload.sub);
  }

  async signInWithDevice(username: string, device: DeviceEntity, fingerprint: string) {
    const jwtToken = await this.createToken(username, fingerprint, device, PayloadScopeEnum.REFRESH_TOKEN, REFRESH_TOKEN_OPTIONS.expiresIn);
    return { jwtToken };
  }

  async signInFromRefreshToken(token: string, fingerprint: string) {
    const payload = await this.jwtService.verifyAsync<JwtPayload>(token, { issuer: fingerprint });
    const user = await this.userService.findById(payload.sub);
    if (!user) {
      throw new UnauthorizedException('error.user.404.userNotFound');
    }

    const device = user.devices.find(d => d.id === payload.device);
    if (!device) {
      throw new UnauthorizedException('error.user.404.deviceNotFound');
    }

    const jwtToken = await this.createToken(payload.sub, fingerprint);

    return { jwtToken, user };
  }

  private async createToken(
    username: string,
    fingerprint: string,
    device?: DeviceEntity,
    scope = PayloadScopeEnum.USER,
    expiresIn = SESSION_TOKEN_OPTIONS.expiresIn,
  ) {
    const payload: JwtPayload = { sub: username, iss: fingerprint, device: device && device.id, scope };
    const jwtToken = await this.jwtService.signAsync(
      payload,
      Object.assign(
        {
          jwtid: new ObjectID().toHexString(),
        },
        {
          expiresIn,
        },
      ),
    );
    return jwtToken;
  }
}
