import * as mongoose from 'mongoose';
import { UserSchema, migrateV1toV2 } from './user.schema';
import { UserEntity } from '../../users/models/user.entity';

describe('LineSchema', () => {
  let UserModel: mongoose.Model<UserEntity>;

  beforeEach(() => {
    UserModel = mongoose.model('User', UserSchema);
  });

  describe('validation', () => {
    it('should not create a line - field required', async () => {
      expect.assertions(1);
      const user = new UserModel();
      try {
        await user.validate();
      } catch (err) {
        expect(Object.keys(err.errors)).toEqual(['password', '_id']);
      }
    });

    it('should create a line - all field fill', async () => {
      const user = new UserModel({
        _id: 'username',
        password: 'password',
      });

      await user.validate();
    });
  });

  describe('migrateV1toV2', () => {
    const docV1 = {
      encryption: {
        salt: 'salt',
        encryptedKey: {
          authTag: 'authTag',
          content: 'content',
        },
      },
    };

    const docV2 = {
      encryption: {
        salt: 'salt',
        iv: null,
        authTag: 'authTag',
        content: 'content',
      },
    };

    const gettersSetters = {
      get(property) {
        return this[property];
      },
      set(property, value) {
        this[property] = value;
      },
    };

    it('migrateV1toV2 - migration', async () => {
      const newDoc = Object.assign({}, gettersSetters, docV1);
      migrateV1toV2(newDoc as any as UserEntity);
      expect(newDoc).toMatchSnapshot('user migration, with migration');
    });

    it('migrateV1toV2 - no migration', async () => {
      const newDoc = Object.assign({}, gettersSetters, docV2);
      migrateV1toV2(newDoc as any as UserEntity);
      expect(newDoc).toMatchSnapshot('user migration, without migration');
    });
  });
});
