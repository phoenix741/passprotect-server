import { Test } from '@nestjs/testing';
import * as mongoose from 'mongoose';
import { Model } from 'mongoose';
import mockingoose from 'mockingoose';
import { UserSchema } from './schemas/user.schema';
import { UserEntity } from './models/user.entity';
import { getModelToken } from '@nestjs/mongoose';
import { UsersService } from './users.service';
import { CryptoService } from '../shared/services/crypto.service';
import { UserToRegister } from './models/user.models';

describe('UsersService', () => {
  let userModel: Model<UserEntity>;
  let usersService: UsersService;
  let cryptoService;

  const doc = {
    _id: 'username',
    password: 'password',
  };

  beforeEach(async () => {
    userModel = mongoose.model('User', UserSchema);
    cryptoService = {
      hashPassword: jest
        .fn()
        .mockImplementation(password => `hashed${password}`),
      checkPassword: jest.fn().mockImplementation((p1, p2) => p1 === p2),
    };

    const module = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: CryptoService,
          useValue: cryptoService,
        },
        {
          provide: getModelToken('User'),
          useValue: userModel,
        },
      ],
    }).compile();

    usersService = module.get<UsersService>(UsersService);
  });

  describe('findAll', () => {
    it('success', async () => {
      mockingoose(userModel).toReturn([doc], 'find');
      const users = await usersService.findAll();
      expect(users.map(user => user.toObject())).toMatchSnapshot(
        'result of find all users',
      );
    });
  });

  describe('findById', () => {
    it('success, with id', async () => {
      mockingoose(userModel).toReturn(doc, 'findOne');
      const user = await usersService.findById('username');
      expect(user.toObject()).toMatchSnapshot('result of find user by id');
    });

    it('success, without id', async () => {
      mockingoose(userModel).toReturn(doc, 'findOne');
      const user = await usersService.findById(null);
      expect(user).toBeNull();
    });
  });

  describe('registerUser', () => {
    it('success', async () => {
      const user: UserToRegister = {
        _id: 'username',
        password: 'password',
        encryption: {
          salt: Buffer.from('salt'),
          iv: Buffer.from('iv'),
          authTag: Buffer.from('authTag'),
          content: Buffer.from('content'),
        },
      };
      mockingoose(userModel).toReturn((userToCreate: UserEntity) => {
        expect(userToCreate.toObject()).toMatchSnapshot(
          { createdAt: expect.any(Date), updatedAt: expect.any(Date) },
          'user to create',
        );
        return user;
      }, 'save');
      const userCreated = await usersService.registerUser(user);
      expect(userCreated).toMatchSnapshot('registered user');
    });
  });

  describe('verifyPassword', () => {
    it('success', async () => {
      const user: UserEntity = {
        _id: 'username',
        password: 'password',
      } as UserEntity;
      const isValid = await usersService.verifyPassword(user, 'password');
      expect(isValid).toEqual(user);
    });

    it('failed', async () => {
      const user: UserEntity = {
        _id: 'username',
        password: 'password',
      } as UserEntity;
      await expect(
        usersService.verifyPassword(user, 'failed'),
      ).rejects.toThrowErrorMatchingSnapshot();
    });
  });
});
