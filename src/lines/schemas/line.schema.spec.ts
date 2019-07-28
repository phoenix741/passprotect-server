import * as mongoose from 'mongoose';
import { LineSchema, migrateV1toV2 } from './line.schema';
import { LineEntity } from '../../lines/models/line.entity';
import { ObjectID } from 'bson';
import { LineTypeEnum } from '../../shared/interfaces/line-type-enum.interface';

describe('LineSchema', () => {
  let LineModel: mongoose.Model<LineEntity>;

  beforeEach(() => {
    LineModel = mongoose.model('Line', LineSchema);
  });

  describe('validation', () => {
    it('should not create a line - field required', async () => {
      expect.assertions(1);
      const line = new LineModel();
      try {
        await line.validate();
      } catch (err) {
        expect(Object.keys(err.errors)).toEqual(['user', 'group', 'type', 'label']);
      }
    });

    it('should create a line - all field fill', async () => {
      const line = new LineModel({
        label: 'Test',
        group: 'Group Test',
        type: LineTypeEnum.password,
        user: 'toto',
      });

      await line.validate();
    });
  });

  describe('migrateV1toV2', () => {
    const docV1 = {
      _id: new ObjectID('5ce1adc75fbbf35ab1af77ac'),
      type: LineTypeEnum.card,
      label: 'label',
      group: 'group',
      user: 'user',
      encryption: {
        salt: 'salt',
        informations: {
          authTag: 'authTag',
          content: 'content',
        },
      },
    };

    const docV2 = {
      _id: docV1._id,
      type: LineTypeEnum.card,
      label: 'label',
      group: 'group',
      user: 'user',
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
      migrateV1toV2((newDoc as any) as LineEntity);
      expect(newDoc).toMatchSnapshot('line migration, with migration');
    });

    it('migrateV1toV2 - no migration', async () => {
      const newDoc = Object.assign({}, gettersSetters, docV2);
      migrateV1toV2((newDoc as any) as LineEntity);
      expect(newDoc).toMatchSnapshot('line migration, without migration');
    });
  });
});
