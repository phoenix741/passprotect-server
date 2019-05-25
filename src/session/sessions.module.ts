import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { SessionsService } from './sessions.service';
import { UsersModule } from '../users/users.module';
import { JwtStrategy } from './jwt.strategy';
import { SharedModule } from '../shared/shared.module';
import { ConfigService } from '../config/config.service';
import { ConfigModule } from '../config/config.module';

@Module({
  imports: [
    SharedModule,
    PassportModule.register({ defaultStrategy: 'jwt', session: false }),
    JwtModule.registerAsync({
      useExisting: ConfigService,
      imports: [ConfigModule],
    }),
    UsersModule,
  ],
  providers: [SessionsService, JwtStrategy],
  exports: [SessionsService],
})
export class SessionsModule {}
