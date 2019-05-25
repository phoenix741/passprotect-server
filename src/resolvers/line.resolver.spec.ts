import { Test } from '@nestjs/testing';
import { LineResolver } from './line.resolver';
import { UsersService } from 'src/users/users.service';
import { LinesService } from 'src/lines/lines.service';
import { AuthorizationService } from 'src/shared/services/authorization.service';
import { WalletLineCreateInput } from 'src/lines/dto/wallet-line-create-input.dto';
import { LineTypeEnum } from 'src/shared/interfaces/line-type-enum.interface';
import { UserEntity } from 'src/users/models/user.entity';
import { FunctionalError } from 'src/shared/models/functional-error';
import { WalletLineUpdateInput } from 'src/lines/dto/wallet-line-update-input.dto';
import { ObjectID } from 'bson';
import { LineEntity } from 'src/lines/models/line.entity';

describe('LineResolver', () => {
  let lineResolver: LineResolver;
  let userService;
  let linesService;
  let authorizationService;
  const user: UserEntity = {
    _id: 'username',
  } as any as UserEntity;
  const line: LineEntity = {
    _id: 'line',
    user: 'userline',
    type: LineTypeEnum.card,
  } as any as LineEntity;

  beforeEach(async () => {
    userService = {
      findById: jest.fn(),
    };
    linesService = {
      findAll: jest.fn(),
      findById: jest.fn(),
      createLine: jest.fn(),
      getGroups: jest.fn(),
      updateLine: jest.fn(),
      removeLine: jest.fn(),
    };
    authorizationService = {
      checkPermission: jest.fn(),
    };

    const module = await Test.createTestingModule({
      providers: [
        LineResolver,
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

    lineResolver = module.get<LineResolver>(LineResolver);
  });

  describe('user', () => {
    it('success', async () => {
      userService.findById.mockImplementation(() => user);
      expect(await lineResolver.user(line, user)).toMatchSnapshot();
      expect(authorizationService.checkPermission).toHaveBeenCalledWith(user, 'userline');
      expect(userService.findById).toHaveBeenCalledWith('userline');
    });
  });

  describe('lines', () => {
    it('success', async () => {
      linesService.findAll.mockImplementation(() => [line]);
      expect(await lineResolver.lines(user)).toMatchSnapshot();
      expect(authorizationService.checkPermission).toHaveBeenCalledWith(user);
      expect(linesService.findAll).toHaveBeenCalledWith('username');
    });
  });

  describe('line', () => {
    it('success', async () => {
      linesService.findById.mockImplementation(() => line);
      expect(await lineResolver.line('123456789012', user)).toMatchSnapshot();
      expect(authorizationService.checkPermission).toHaveBeenCalledWith(user, 'userline');
      expect(linesService.findById).toHaveBeenCalledWith(new ObjectID('123456789012'));
    });

    it('failed', async () => {
      linesService.findById.mockImplementation(() => line);
      authorizationService.checkPermission.mockImplementation((user, id) => {
        if (id) {
          throw new Error('not authorized exception');
        }
      });
      await expect(lineResolver.line('123456789012', user)).rejects.toThrowErrorMatchingSnapshot();
      expect(authorizationService.checkPermission).toHaveBeenCalledWith(user, 'userline');
      expect(linesService.findById).toHaveBeenCalledWith(new ObjectID('123456789012'));
    });
  });

  describe('groups', () => {
    it('success', async () => {
      linesService.getGroups.mockImplementation(() => ['group1', 'group2']);
      expect(await lineResolver.groups(user)).toMatchSnapshot();
      expect(authorizationService.checkPermission).toHaveBeenCalledWith(user);
      expect(linesService.getGroups).toHaveBeenCalledWith('username');
    });
  });

  describe('createLine', () => {
    it('success', async () => {
      const input = new WalletLineCreateInput();
      input.label = 'label';
      input.type = LineTypeEnum.text;
      input.group = 'group';
      linesService.createLine.mockImplementation(() => ({ _id: 'lineEntityId' }));
      expect(await lineResolver.createLine(input, user)).toMatchSnapshot();
      expect(linesService.createLine).toHaveBeenCalledWith({group: 'group', label: 'label', type: 'text', user: 'username'});
      expect(authorizationService.checkPermission).toHaveBeenCalledWith(user);
    });

    it('error - signin', async () => {
      const input = new WalletLineCreateInput();
      input.label = 'label';
      input.type = LineTypeEnum.text;
      input.group = 'group';
      linesService.createLine.mockImplementation(() => {
        throw new FunctionalError('myfield', 'mymessage');
      });
      expect(await lineResolver.createLine(input, user)).toMatchSnapshot();
      expect(linesService.createLine).toHaveBeenCalledWith({group: 'group', label: 'label', type: 'text', user: 'username'});
      expect(authorizationService.checkPermission).toHaveBeenCalledWith(user);
    });
  });

  describe('updateLine', () => {
    it('success', async () => {
      const input = new WalletLineUpdateInput();
      input._id = new ObjectID('5ce85e3daa2aa003aea7b6d0');
      input.label = 'label';
      input.type = LineTypeEnum.text;
      input.group = 'group';

      linesService.findById.mockImplementation(() => line);
      linesService.updateLine.mockImplementation(() => ({ _id: 'lineEntityId' }));
      expect(await lineResolver.updateLine(input, user)).toMatchSnapshot();
      expect(linesService.updateLine).toHaveBeenCalledWith({_id: 'line', type: 'card', user: 'userline'}, input);
      expect(authorizationService.checkPermission).toHaveBeenCalledWith(user);
      expect(authorizationService.checkPermission).toHaveBeenCalledWith(user, 'userline');
    });

    it('error - line not found', async () => {
      const input = new WalletLineUpdateInput();
      input._id = new ObjectID('5ce85e3daa2aa003aea7b6d0');
      input.label = 'label';
      input.type = LineTypeEnum.text;
      input.group = 'group';

      linesService.findById.mockImplementation(() => null);
      expect(await lineResolver.updateLine(input, user)).toMatchSnapshot();
      expect(authorizationService.checkPermission).toHaveBeenCalledWith(user);
      expect(linesService.updateLine).not.toHaveBeenCalled();
      expect(authorizationService.checkPermission).not.toHaveBeenCalledWith(user, 'userline');
    });

    it('error - update', async () => {
      const input = new WalletLineUpdateInput();
      input._id = new ObjectID('5ce85e3daa2aa003aea7b6d0');
      input.label = 'label';
      input.type = LineTypeEnum.text;
      input.group = 'group';

      linesService.findById.mockImplementation(() => line);
      linesService.updateLine.mockImplementation(() => {
        throw new FunctionalError('myfield', 'mymessage');
      });
      expect(await lineResolver.updateLine(input, user)).toMatchSnapshot();
      expect(linesService.updateLine).toHaveBeenCalledWith({_id: 'line', type: 'card', user: 'userline'}, input);
      expect(authorizationService.checkPermission).toHaveBeenCalledWith(user);
      expect(authorizationService.checkPermission).toHaveBeenCalledWith(user, 'userline');
    });
  });

  describe('removeLine', () => {
    it('success', async () => {
      const id = '5ce85e3daa2aa003aea7b6d0';

      linesService.findById.mockImplementation(() => line);
      linesService.removeLine.mockImplementation(() => ({ _id: 'lineEntityId' }));
      expect(await lineResolver.removeLine(id, user)).toMatchSnapshot();
      expect(linesService.removeLine).toHaveBeenCalledWith(new ObjectID('5ce85e3daa2aa003aea7b6d0'));
      expect(authorizationService.checkPermission).toHaveBeenCalledWith(user);
      expect(authorizationService.checkPermission).toHaveBeenCalledWith(user, 'userline');
    });

    it('error - line not found', async () => {
      const id = '5ce85e3daa2aa003aea7b6d0';

      linesService.findById.mockImplementation(() => null);
      expect(await lineResolver.removeLine(id, user)).toMatchSnapshot();
      expect(authorizationService.checkPermission).toHaveBeenCalledWith(user);
      expect(linesService.removeLine).not.toHaveBeenCalled();
      expect(authorizationService.checkPermission).not.toHaveBeenCalledWith(user, 'userline');
    });

    it('error - update', async () => {
      const id = '5ce85e3daa2aa003aea7b6d0';

      linesService.findById.mockImplementation(() => line);
      linesService.removeLine.mockImplementation(() => {
        throw new FunctionalError('myfield', 'mymessage');
      });
      expect(await lineResolver.removeLine(id, user)).toMatchSnapshot();
      expect(linesService.removeLine).toHaveBeenCalledWith(new ObjectID('5ce85e3daa2aa003aea7b6d0'));
      expect(authorizationService.checkPermission).toHaveBeenCalledWith(user);
      expect(authorizationService.checkPermission).toHaveBeenCalledWith(user, 'userline');
    });
  });
});
