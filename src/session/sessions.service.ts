import { JwtService } from '@nestjs/jwt';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtPayload } from '../users/models/user.models';
import { UserEntity } from '../users/models/user.entity';

@Injectable()
export class SessionsService {
  constructor(
    private readonly userService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async signIn(
    username: string,
    password: string,
  ): Promise<{ user: UserEntity; jwtToken: string }> {
    const user = await this.userService.findById(username);
    if (!user) {
      throw new UnauthorizedException('error:user.404.userNotFound');
    }

    await this.userService.verifyPassword(user, password);
    const payload: JwtPayload = { _id: username };
    const jwtToken = await this.jwtService.sign(payload);
    return { user, jwtToken };
  }

  async validateUser(payload: JwtPayload): Promise<UserEntity> {
    return await this.userService.findById(payload._id);
  }
}
