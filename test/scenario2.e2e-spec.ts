import 'dotenv/config';
import { INestApplication } from '@nestjs/common';
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
  SUBSCRIPTION_QUERY,
} from './scenario2.data';
import { Model } from 'mongoose';
import { UserEntity } from '../src/users/models/user.entity';
import { getModelToken } from '@nestjs/mongoose';
import { LineEntity } from '../src/lines/models/line.entity';
import { TransactionEntity } from '../src/transactions/models/transaction.entity';
import * as WebSocket from 'ws';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let userModel: Model<UserEntity>;
  let lineModel: Model<LineEntity>;
  let transactionModel: Model<TransactionEntity>;
  let connectionTokenUser1: string;
  let connectionTokenUser2: string;
  let ws: WebSocket;
  const messages: string[] = [];

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

  function createRequest(query: string, variables: object, connectionToken?: string) {
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
        connectionTokenUser1 = res.body.data.createSession.token;
      });
  });

  it('Create subscription', async () => {
    console.log(app.getHttpServer());
    ws = new WebSocket(app.getHttpServer().replace('http', 'ws') + '/graphql');
    await new Promise(resolve => ws.on('open', resolve));
    ws.on('message', data => {
      messages.push(data.toString());
      console.log(data.toString());
    }),
    ws.send(JSON.stringify({ type: 'connection_init', payload: { Authorization: connectionTokenUser1 } }));
    ws.send(JSON.stringify({ id: 1, type: 'start', payload: {
      variables: {},
      operationName: 'transactionSubscription',
      query: SUBSCRIPTION_QUERY,
    }}));
  });

  it('Login the user 2', () => {
    return createRequest(LOGIN_USER_QUERY, LOGIN_USER_2_VARIABLES)
      .expect(200)
      .expect(res => {
        expect(res.body.data.createSession).toMatchSnapshot({
          token: expect.any(String),
        });
        connectionTokenUser2 = res.body.data.createSession.token;
      });
  });

  afterAll(async () => {
    ws.send(JSON.stringify({ id: 1, type: 'stop' }));
    ws.close();
    await app.close();
  });
});
