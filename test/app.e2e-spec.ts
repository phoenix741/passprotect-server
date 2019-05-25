import 'dotenv/config';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('AppController (e2e)', () => {
  let app;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/graphql (GET)', () => {
    return request(app.getHttpServer())
      .post('/graphql')
      .set('content-type', 'application/json')
      .send({
        operationName: null,
        variables: {
          input: {
            _id: '1234',
            password: '11111111',
            encryption: {
              salt: 'dGVzdA==',
              iv: 'dGVzdA==',
              content: 'dGVzdA==',
              authTag: 'dGVzdA==',
            },
          },
        },
        query: `
        mutation($input: RegistrationUserInput!) {
          registerUser(input: $input) {
            __typename
            ... on User {
              _id
              createdAt
            }
            ... on Errors {
              errors {
                fieldName
                message
              }
            }
          }
        }`,
      })
      .expect(200)
      .expect({
        data: {
          registerUser: {
            __typename: 'Errors',
            errors: [
              {
                fieldName: 'username',
                message:
                  'E11000 duplicate key error collection: passprotect.users index: _id_ dup key: { : "1234" }',
              },
            ],
          },
        },
      });
  });

  afterAll(() => {
    app.close();
  });
});
