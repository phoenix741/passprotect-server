import { JwtStrategy } from './jwt.strategy';
import { Test } from '@nestjs/testing';
import { SessionsService } from './sessions.service';
import { ConfigService } from '../config/config.service';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;
  let sessionService;
  const configService = {
    jwtSecret: 'mysecret',
  };

  beforeEach(async () => {
    sessionService = {
      validateUser: jest.fn(),
    };

    const module = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        {
          provide: SessionsService,
          useValue: sessionService,
        },
        {
          provide: ConfigService,
          useValue: configService,
        },
      ],
    }).compile();

    strategy = module.get<JwtStrategy>(JwtStrategy);
  });

  describe('validate', () => {
    it('user authorized', async () => {
      sessionService.validateUser.mockImplementation(() => 'username1');
      expect(await strategy.validate({ sub: 'username1', issuer: 'fingerprint' })).toMatchSnapshot('username1');
    });

    it('user refused', async () => {
      sessionService.validateUser.mockImplementation(() => null);
      expect(strategy.validate({ sub: 'username2', issuer: 'fingerprint' })).rejects.toThrowErrorMatchingSnapshot();
    });
  });
});
