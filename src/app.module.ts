import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from './config/config.module';
import { UsersModule } from './users/users.module';
import { LinesModule } from './lines/lines.module';
import { TransactionsModule } from './transactions/transactions.module';
import { SharedModule } from './shared/shared.module';
import { SessionsModule } from './session/sessions.module';
import { UserResolver } from './resolvers/user.resolver';
import { SessionResolver } from './resolvers/session.resolver';
import { LineResolver } from './resolvers/line.resolver';
import { TransactionResolver } from './resolvers/transaction.resolver';
import { ConfigService } from './config/config.service';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useExisting: ConfigService,
    }),
    GraphQLModule.forRoot({
      autoSchemaFile: 'schema.gql',
      context: ({ req, connection }) => {
        if (connection) {
          req = {
            headers: { authorization: connection.context.Authorization },
          };
        }

        return { req };
      },
      installSubscriptionHandlers: true,
    }),
    SharedModule,
    UsersModule,
    SessionsModule,
    LinesModule,
    TransactionsModule,
  ],
  providers: [UserResolver, SessionResolver, LineResolver, TransactionResolver],
})
export class AppModule {}
