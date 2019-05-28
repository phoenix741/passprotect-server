import 'dotenv/config';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import {
  REGISTER_USER_QUERY,
  REGISTER_USER_1_VARIABLES,
  REGISTER_USER_2_VARIABLES,
  LOGIN_USER_QUERY,
  LOGIN_USER_1_VARIABLES,
  LOGIN_USER_2_VARIABLES,
} from './scenario2.data';
import { Model } from 'mongoose';
import { UserEntity } from '../src/users/models/user.entity';
import { getModelToken } from '@nestjs/mongoose';
import { LineEntity } from '../src/lines/models/line.entity';
import { TransactionEntity } from '../src/transactions/models/transaction.entity';

describe('AppController (e2e)', () => {
  let app;
  let userModel: Model<UserEntity>;
  let lineModel: Model<LineEntity>;
  let transactionModel: Model<TransactionEntity>;
  let connectionToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    userModel = moduleFixture.get<Model<UserEntity>>(getModelToken('User'));
    lineModel = moduleFixture.get<Model<LineEntity>>(getModelToken('Line'));
    transactionModel = moduleFixture.get<Model<TransactionEntity>>(
      getModelToken('Transaction'),
    );
  });

  function createRequest(query, variables) {
    return request(app.getHttpServer())
      .post('/graphql')
      .set('authorization', connectionToken || '')
      .set('content-type', 'application/json')
      .send({
        operationName: null,
        variables,
        query,
      });
  }

  it('Remove old user', async () => {
    await Promise.all(
      ['demo2', 'demo3'].map(async (user) => {
        await userModel.deleteMany({ _id: user });
        await lineModel.deleteMany({ user });
        await transactionModel.deleteMany({ user });
      }),
    );
  });

  it('Register user 1', () => {
    return createRequest(REGISTER_USER_QUERY, REGISTER_USER_1_VARIABLES)
      .expect(200)
      .expect(res => {
        expect(res.body.data.registerUser).toMatchSnapshot();
      });
  });

  it('Register user 2', () => {
    return createRequest(REGISTER_USER_QUERY, REGISTER_USER_2_VARIABLES)
      .expect(200)
      .expect(res => {
        expect(res.body.data.registerUser).toMatchSnapshot();
      });
  });

  it('Login the user 1', () => {
    return createRequest(LOGIN_USER_QUERY, LOGIN_USER_1_VARIABLES)
      .expect(200)
      .expect(res => {
        expect(res.body.data.createSession).toMatchSnapshot({
          token: expect.any(String),
        });
        connectionToken = res.body.data.createSession.token;
      });
  });

  it('Login the user 2', () => {
    return createRequest(LOGIN_USER_QUERY, LOGIN_USER_2_VARIABLES)
      .expect(200)
      .expect(res => {
        expect(res.body.data.createSession).toMatchSnapshot({
          token: expect.any(String),
        });
        connectionToken = res.body.data.createSession.token;
      });
  });

  afterAll(async () => {
    await app.close();
  });
});
