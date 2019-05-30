import { GqlAuthGuard } from './gql-auth.guard';

describe('GqlAuthGuard', () => {
  let guard;

  beforeEach(() => {
    guard = new GqlAuthGuard();
  });

  describe('getRequest', () => {
    it('convert express context to graphql', () => {
      const context = {
        getArgByIndex(idx) {
          return idx;
        },
        getContext() {
          return {
            req: {
              session: 'session',
              user: 'user',
            },
          };
        },
      };
      expect(guard.getRequest(context)).toMatchSnapshot('request of the context');
    });
  });
});
