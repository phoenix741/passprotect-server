import { Test } from '@nestjs/testing';
import { SessionResolver } from './session.resolver';
import { SessionsService } from '../session/sessions.service';
import { User } from '../users/dto/user.dto';
import { ConnectionInformationInput } from '../session/dto/connection-information-input.dto';
import { FunctionalError } from '../shared/models/functional-error';

describe('SessionResolver', () => {
  let sessionResolver: SessionResolver;
  let sessionService;

  const user: User = new User();

  beforeEach(async () => {
    user._id = 'username';
    sessionService = {
      signIn: jest.fn(),
    };

    const module = await Test.createTestingModule({
      providers: [
        SessionResolver,
        {
          provide: SessionsService,
          useValue: sessionService,
        },
      ],
    }).compile();

    sessionResolver = module.get<SessionResolver>(SessionResolver);
  });

  describe('session', () => {
    it('success', async () => {
      expect(await sessionResolver.session(user)).toMatchSnapshot();
    });
  });

  describe('createSession', () => {
    it('success', async () => {
      const input = new ConnectionInformationInput();
      input.username = 'myUsername';
      input.password = 'password';
      sessionService.signIn.mockImplementation(() => ({
        jwtToken: 'myToken',
        user,
      }));
      expect(await sessionResolver.createSession(input)).toMatchSnapshot();
      expect(sessionService.signIn).toHaveBeenCalledWith('myUsername', 'password');
    });

    it('error - signin', async () => {
      const input = new ConnectionInformationInput();
      input.username = 'myUsername';
      input.password = 'password';
      sessionService.signIn.mockImplementation(() => {
        throw new FunctionalError('myfield', 'mymessage');
      });
      expect(await sessionResolver.createSession(input)).toMatchSnapshot();
      expect(sessionService.signIn).toHaveBeenCalledWith('myUsername', 'password');
    });

    it('error - no username', async () => {
      const input = new ConnectionInformationInput();
      input.username = '';
      input.password = 'password';
      expect(await sessionResolver.createSession(input)).toMatchSnapshot();
      expect(sessionService.signIn).not.toHaveBeenCalled();
    });

    it('error - no password', async () => {
      const input = new ConnectionInformationInput();
      input.username = 'myUsername';
      input.password = '';
      expect(await sessionResolver.createSession(input)).toMatchSnapshot();
      expect(sessionService.signIn).not.toHaveBeenCalled();
    });
  });
});
