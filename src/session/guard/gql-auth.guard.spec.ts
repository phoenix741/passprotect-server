import { GqlAuthGuard } from './gql-auth.guard';

describe('GqlAuthGuard', () => {
  let guard;
  let context;
  let req;

  beforeEach(() => {
    guard = new GqlAuthGuard();
    req = {
      session: 'session',
      user: 'user',
      fingerprint: {
        hash: 'fingerprint1',
      },
      headers: {
        authorization: 'bearer ' +
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.' +
          'eyJzdWIiOiJJRElEIiwiaXNzdWVyIjoiMjRhNzM1MmM5MTlkMzUyMzNlNWQ4M2RhYWZmNDQzNmMiLCJpY' +
          'XQiOjE1NjQzMzc2MDMsImV4cCI6MTU2NDMzODUwMywianRpIjoiNWQzZGU1YzMyNWU3NjIzNzE1NGQ3MjM' +
          'xIn0.xAlbFEAh9Sk3ck47D54y6jB6Qy9d6pgof7jkn8OELFo',
      },
    };
    context = {
      getArgByIndex(idx) {
        return idx;
      },
      getContext() {
        return {
          req,
        };
      },
    };
  });

  describe('canActivate', () => {
    it('hash equals', () => {
      req.fingerprint.hash = '24a7352c919d35233e5d83daaff4436c';
      guard.canActivate(context);
    });

    it('hash different', () => {
      try {
        guard.canActivate(context);

        throw new Error('Hash should be different');
      } catch (err) {
        expect(err.message).toEqual({
          error: 'Unauthorized',
          message: 'The requester fingerprint1 is incompatible with the issuer 24a7352c919d35233e5d83daaff4436c',
          statusCode: 401,
        });
      }
    });
  });

  describe('getRequest', () => {
    it('convert express context to graphql', () => {
      expect(guard.getRequest(context)).toMatchSnapshot('request of the context');
    });
  });
});
