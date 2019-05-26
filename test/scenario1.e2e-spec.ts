import 'dotenv/config';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { REGISTER_USER_QUERY, REGISTER_USER_VARIABLES, LOGIN_USER_VARIABLES, LOGIN_USER_QUERY, LINES_QUERY, LINES_VARIABLE, CREATE_LINE_QUERY, CREATE_LINE_TEXT_VARIABLES, CREATE_LINE_PASSWORD_VARIABLES, CREATE_LINE_CARD_VARIABLES } from './scenario1.data';
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

  it('Remove old user', async () => {
    await userModel.deleteMany({ _id: 'demo' });
    await lineModel.deleteMany({ user: 'demo' });
    await transactionModel.deleteMany({ user: 'demo' });
  });

  it('Register user', () => {
    return request(app.getHttpServer())
      .post('/graphql')
      .set('content-type', 'application/json')
      .send({
        operationName: null,
        variables: REGISTER_USER_VARIABLES,
        query: REGISTER_USER_QUERY,
      })
      .expect(200)
      .expect(res => {
        expect(res.body.data.registerUser).toMatchSnapshot();
      });
  });

  it('Login the user', () => {
    return request(app.getHttpServer())
      .post('/graphql')
      .set('content-type', 'application/json')
      .send({
        operationName: null,
        variables: LOGIN_USER_VARIABLES,
        query: LOGIN_USER_QUERY,
      })
      .expect(200)
      .expect(res => {
        expect(res.body.data.createSession).toMatchSnapshot({
          token: expect.any(String),
        });
        connectionToken = res.body.data.createSession.token;
      });
  });

  it('Get lines, no lines', () => {
    return request(app.getHttpServer())
      .post('/graphql')
      .set('authorization', connectionToken)
      .set('content-type', 'application/json')
      .send({
        operationName: null,
        variables: LINES_VARIABLE,
        query: LINES_QUERY,
      })
      .expect(200)
      .expect(res => {
        expect(res.body.data).toMatchSnapshot();
      });
  });

  it('Create line, text', () => {
    return request(app.getHttpServer())
      .post('/graphql')
      .set('authorization', connectionToken)
      .set('content-type', 'application/json')
      .send({
        operationName: null,
        variables: CREATE_LINE_TEXT_VARIABLES,
        query: CREATE_LINE_QUERY,
      })
      .expect(200)
      .expect(res => {
        expect(res.body.data).toMatchSnapshot();
      });
  });

  it('Create line, card', () => {
    return request(app.getHttpServer())
      .post('/graphql')
      .set('authorization', connectionToken)
      .set('content-type', 'application/json')
      .send({
        operationName: null,
        variables: CREATE_LINE_CARD_VARIABLES,
        query: CREATE_LINE_QUERY,
      })
      .expect(200)
      .expect(res => {
        expect(res.body.data).toMatchSnapshot();
      });
  });

  it('Create line, password', () => {
    return request(app.getHttpServer())
      .post('/graphql')
      .set('authorization', connectionToken)
      .set('content-type', 'application/json')
      .send({
        operationName: null,
        variables: CREATE_LINE_PASSWORD_VARIABLES,
        query: CREATE_LINE_QUERY,
      })
      .expect(200)
      .expect(res => {
        expect(res.body.data).toMatchSnapshot();
      });
  });

  it('Get lines, three lines', () => {
    return request(app.getHttpServer())
      .post('/graphql')
      .set('authorization', connectionToken)
      .set('content-type', 'application/json')
      .send({
        operationName: null,
        variables: LINES_VARIABLE,
        query: LINES_QUERY,
      })
      .expect(200)
      .expect(res => {
        expect(res.body.data).toMatchSnapshot();
      });
  });

  afterAll(async () => {
    await app.close();
  });
});
