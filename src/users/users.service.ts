import { Model } from 'mongoose';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { UserToRegister } from './models/user.models';
import { UserEntity } from './models/user.entity';
import { CryptoService } from '../shared/services/crypto.service';
import { DeviceEntity } from '../users/models/user.entity';

@Injectable()
export class UsersService {
  constructor(private readonly cryptoService: CryptoService, @InjectModel('User') private readonly userModel: Model<UserEntity>) {}

  async findAll(): Promise<UserEntity[]> {
    return await this.userModel.find().exec();
  }

  async findById(id: string): Promise<UserEntity | null> {
    return id && (await this.userModel.findById(id.toLowerCase()));
  }

  async registerUser(user: UserToRegister): Promise<UserEntity> {
    user.password = await this.cryptoService.hashPassword(user.password);

    return await this.userModel.create(user);
  }

  async verifyPassword(user: UserEntity, password: string): Promise<UserEntity> {
    const isValid = await this.cryptoService.checkPassword(password, user.password);
    if (!isValid) {
      throw new UnauthorizedException('error.user.404.userNotFound');
    }
    return user;
  }
}
