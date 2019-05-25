import { Test } from '@nestjs/testing';
import { UserResolver } from './user.resolver';
import { UsersService } from 'src/users/users.service';
import { LinesService } from 'src/lines/lines.service';
import { AuthorizationService } from 'src/shared/services/authorization.service';
import { User } from 'src/users/dto/user.dto';
import { LineEntity } from 'src/lines/models/line.entity';
import { RegistrationUserInput } from 'src/users/dto/registration-user.dto';
import { FunctionalError } from 'src/shared/models/functional-error';

describe('UserResolver', () => {
  let userResolver: UserResolver;
  let userService;
  let linesService;
  let authorizationService;

  const user: User = new User();
  const lines: LineEntity[] = [
    { _id: 'lineId' } as any as LineEntity,
  ];

  beforeEach(async () => {
    userService = {
      findById: jest.fn(),
      registerUser: jest.fn(),
    };
    linesService = {
      findAll: jest.fn(),
    };
    authorizationService = {
      checkPermission: jest.fn(),
    };
    user._id = 'username';

    const module = await Test.createTestingModule({
      providers: [
        UserResolver,
        {
          provide: UsersService,
          useValue: userService,
        },
        {
          provide: LinesService,
          useValue: linesService,
        },
        {
          provide: AuthorizationService,
          useValue: authorizationService,
        },
      ],
    })
    .compile();

    userResolver = module.get<UserResolver>(UserResolver);
  });

  describe('user', () => {
    it('success', async () => {
      userService.findById.mockImplementation(() => user);
      expect(await userResolver.user('username', user)).toMatchSnapshot();
      expect(authorizationService.checkPermission).toHaveBeenCalledWith(user, 'username');
      expect(userService.findById).toHaveBeenCalledWith('username');
    });
  });

  describe('lines', () => {
    it('success', async () => {
      linesService.findAll.mockImplementation(() => lines);
      expect(await userResolver.lines(user, user)).toMatchSnapshot();
      expect(authorizationService.checkPermission).toHaveBeenCalledWith(user, 'username');
      expect(linesService.findAll).toHaveBeenCalledWith('username');
    });
  });

  describe('registerUser', () => {
    it('success', async () => {
      const input = new RegistrationUserInput();
      input._id = 'registeredUsername';
      input.password = 'password';
      userService.registerUser.mockImplementation(() => user);
      expect(await userResolver.registerUser(input)).toMatchSnapshot();
      expect(userService.registerUser).toHaveBeenCalledWith(input);
    });

    it('error', async () => {
      const input = new RegistrationUserInput();
      input._id = 'registeredUsername';
      input.password = 'password';
      userService.registerUser.mockImplementation(() => {
        throw new FunctionalError('myfield', 'mymessage');
      });
      expect(await userResolver.registerUser(input)).toMatchSnapshot();
      expect(userService.registerUser).toHaveBeenCalledWith(input);
    });
  });
});
