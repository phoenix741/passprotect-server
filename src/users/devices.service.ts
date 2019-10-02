import { Model } from 'mongoose';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserEntity } from './models/user.entity';
import { DeviceEntity } from './models/user.entity';
import { UsersService } from './users.service';

@Injectable()
export class DevicesService {
  constructor(private readonly userService: UsersService) {}

  async findAll(userId: string): Promise<DeviceEntity[]> {
    if (userId) {
      const user = await this.userService.findById(userId);
      return user.devices;
    }
    return [];
  }

  async verifyDevice(user: UserEntity, deviceId: string): Promise<UserEntity> {
    const isValid = user.devices.find(d => d.id === deviceId);
    if (!isValid) {
      throw new UnauthorizedException('error.user.404.userNotFound');
    }
    return user;
  }

  async registerDevice(userId: string, device: DeviceEntity): Promise<DeviceEntity> {
    const user = await this.userService.findById(userId);
    if (!user) {
      throw new UnauthorizedException('error.user.404.userNotFound');
    }

    const found = user.devices.find(d => d.id === device.id);
    if (!found) {
      user.devices.push(device);
      await user.save();
    }
    return found || device;
  }

  async removeDevice(userId: string, deviceId: string): Promise<void> {
    const user = await this.userService.findById(userId);
    if (!user) {
      throw new UnauthorizedException('error.user.404.userNotFound');
    }

    user.devices = user.devices.filter(d => d.id !== deviceId);
    await user.save();
  }
}
