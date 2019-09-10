import { Module } from '@nestjs/common';
import { CryptoService } from './services/crypto.service';
import { AuthorizationService } from './services/authorization.service';
import { DateScalar } from './resolvers/date.scalar';
import { BufferScalar } from './resolvers/buffer.scalar';
import { ObjectIDScalar } from './resolvers/object-id.scalar';

@Module({
  providers: [CryptoService, AuthorizationService, DateScalar, BufferScalar, ObjectIDScalar],
  exports: [CryptoService, AuthorizationService],
})
export class SharedModule {}
