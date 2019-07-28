import { Test } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { SessionsService } from './sessions.service';

describe('SessionsService', () => {
  let userService;
  let jwtService;
  let sessionsService;

  const userEntity = {
    _id: 'username',
    password: 'password',
    encryption: {
      salt: Buffer.from('salt'),
      iv: Buffer.from('iv'),
      content: Buffer.from('content'),
      authTag: Buffer.from('authTag'),
    },
  };

  const jwtToken = 'myJwtToken';

  beforeEach(async () => {
    userService = {
      findById: jest.fn().mockImplementation(() => userEntity),
      verifyPassword: jest.fn().mockImplementation(() => userEntity),
    };
    jwtService = {
      sign: jest.fn().mockImplementation(() => jwtToken),
    };

    const module = await Test.createTestingModule({
      providers: [
        SessionsService,
        {
          provide: UsersService,
          useValue: userService,
        },
        {
          provide: JwtService,
          useValue: jwtService,
        },
      ],
    }).compile();

    sessionsService = module.get<SessionsService>(SessionsService);
  });

  describe('signIn', () => {
    it('user not found', async () => {
      userService.findById.mockImplementation(() => null);
      await expect(sessionsService.signIn('username', 'password', 'fingerprint')).rejects.toThrowErrorMatchingSnapshot();
    });

    it('wrong password', async () => {
      userService.verifyPassword.mockImplementation(async () => {
        throw new Error('wrong password');
      });
      await expect(sessionsService.signIn('username', 'password', 'fingerprint')).rejects.toThrowErrorMatchingSnapshot();
    });

    it('user found', async () => {
      expect(await sessionsService.signIn('username', 'password', 'fingerprint')).toMatchSnapshot('user sign in');
      expect(jwtService.sign).toHaveBeenCalledWith({ sub: 'username', issuer: 'fingerprint' }, {expiresIn: '15m', jwtid: expect.any(String)});
    });
  });

  describe('validateUser', () => {
    it('success', async () => {
      await expect(await sessionsService.validateUser({ sub: 'username' })).toMatchSnapshot('user validation');
      expect(userService.findById).toHaveBeenCalledWith('username');
    });
  });
});
