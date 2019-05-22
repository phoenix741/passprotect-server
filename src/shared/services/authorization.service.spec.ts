import { AuthorizationService } from './authorization.service';

describe('AuthorizationService', () => {
  let authorizationService: AuthorizationService;

  beforeEach(() => {
    authorizationService = new AuthorizationService();
  });

  describe('checkPermission', () => {
    it('no user', () => {
      expect(() => authorizationService.checkPermission(null, null)).toThrowError('The user should be authentified to view this resource');
    });

    it('user, userId <>', () => {
      expect(() => authorizationService.checkPermission({ _id: 'username' }, 'username2'))
        .toThrowError('The user isn\'t authorized to view this resource');
    });

    it('user, no userId', () => {
      authorizationService.checkPermission({ _id: 'username' });
    });

    it('user, userId ==', () => {
      authorizationService.checkPermission({ _id: 'username' }, 'username');
    });
  });
});
