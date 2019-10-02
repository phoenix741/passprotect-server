import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserSchema } from './schemas/user.schema';
import { UsersService } from './users.service';
import { SharedModule } from '../shared/shared.module';
import { DevicesService } from './devices.service';

@Module({
  imports: [MongooseModule.forFeature([{ name: 'User', schema: UserSchema }]), SharedModule],
  providers: [UsersService, DevicesService],
  exports: [UsersService, DevicesService],
})
export class UsersModule {}
