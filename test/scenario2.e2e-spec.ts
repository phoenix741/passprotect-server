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
  CREATE_LINE_TEXT_VARIABLES_1,
  CREATE_LINE_QUERY,
  CREATE_LINE_TEXT_VARIABLES_3,
  CREATE_LINE_TEXT_VARIABLES_2,
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
    await app.listenAsync(3000);

    userModel = moduleFixture.get<Model<UserEntity>>(getModelToken('User'));
    lineModel = moduleFixture.get<Model<LineEntity>>(getModelToken('Line'));
    transactionModel = moduleFixture.get<Model<TransactionEntity>>(getModelToken('Transaction'));
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
      ['demo2', 'demo3'].map(async user => {
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
        expect(res.body.data.createSession).toMatchSnapshot({ token: expect.any(String) });
        connectionTokenUser1 = res.body.data.createSession.token;
      });
  });

  it('Create subscription', async () => {
    ws = new WebSocket('ws://localhost:3000/graphql', 'graphql-ws');
    await new Promise(resolve => ws.on('open', resolve));
    ws.on('message', data => {
      messages.push(JSON.parse(data.toString()));
    });
    ws.send(JSON.stringify({ type: 'connection_init', payload: { Authorization: connectionTokenUser1 } }));
    ws.send(JSON.stringify({ id: 1, type: 'start', payload: { operationName: 'transactionSubscription', query: SUBSCRIPTION_QUERY } }));
  });

  it('Login the user 2', () => {
    return createRequest(LOGIN_USER_QUERY, LOGIN_USER_2_VARIABLES)
      .expect(200)
      .expect(res => {
        expect(res.body.data.createSession).toMatchSnapshot({ token: expect.any(String) });
        connectionTokenUser2 = res.body.data.createSession.token;
      });
  });

  it('Create line, text', async () => {
    await Promise.all([
      createRequest(CREATE_LINE_QUERY, CREATE_LINE_TEXT_VARIABLES_1, connectionTokenUser1)
        .expect(200)
        .expect(res => {
          expect(res.body.data).toMatchSnapshot();
        })
        .then(() => {
          return createRequest(CREATE_LINE_QUERY, CREATE_LINE_TEXT_VARIABLES_3, connectionTokenUser1)
            .expect(200)
            .expect(res => {
              expect(res.body.data).toMatchSnapshot();
            });
        }),
      createRequest(CREATE_LINE_QUERY, CREATE_LINE_TEXT_VARIABLES_2, connectionTokenUser2)
        .expect(200)
        .expect(res => {
          expect(res.body.data).toMatchSnapshot();
        }),
    ]);
    await new Promise(resolve => setTimeout(resolve, 1000));
  });

  it('Check that all message receive are good', async () => {
    expect(messages).toMatchSnapshot();
  });

  afterAll(async () => {
    ws.send(JSON.stringify({ id: 1, type: 'stop' }));
    ws.close();
    await app.close();
  });
});
