import { Test } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { LineEntity } from './models/line.entity';
import * as mongoose from 'mongoose';
import mockingoose from 'mockingoose';
import { Model } from 'mongoose';
import { LineSchema } from './schemas/line.schema';
import { LinesService } from './lines.service';
import { TransactionsService } from '../transactions/transactions.service';
import { ObjectID } from 'bson';
import { LineTypeEnum } from '../shared/interfaces/line-type-enum.interface';
import { TransactionTypeEnum } from '../shared/interfaces/transaction-type-enum.interface';

describe('LinesService', () => {
  let lineModel: Model<LineEntity>;
  let linesService: LinesService;
  let transactionsService;

  const doc = {
    _id: new ObjectID('5ce1ae737786b25be429b81f'),
    type: LineTypeEnum.card,
    label: 'label',
    group: 'group',
    user: 'user',
  };

  const docToCreate = {
    type: LineTypeEnum.card,
    label: 'label',
    group: 'group',
    user: 'user',
    encryption: {
      salt: Buffer.from('salt'),
      iv: Buffer.from('iv'),
      authTag: Buffer.from('authTag'),
      content: Buffer.from('content'),
    },
  };

  beforeEach(async () => {
    lineModel = mongoose.model('Line', LineSchema);
    transactionsService = {
      createTransaction: jest.fn(),
    };

    const module = await Test.createTestingModule({
      providers: [
        LinesService,
        {
          provide: getModelToken('Line'),
          useValue: lineModel,
        },
        {
          provide: TransactionsService,
          useValue: transactionsService,
        },
      ],
    }).compile();

    linesService = module.get<LinesService>(LinesService);
  });

  describe('findAll', () => {
    it('call find all - with userId', async () => {
      const userId = 'userId';
      mockingoose(lineModel).toReturn([doc], 'find');
      const lines = await linesService.findAll(userId);
      expect(lines.map(line => line.toObject())).toMatchSnapshot(
        'result of find all with userId',
      );
    });

    it('call find all - without userId', async () => {
      const userId = '';
      mockingoose(lineModel).toReturn([doc], 'find');
      const lines = await linesService.findAll(userId);
      expect(lines).toMatchSnapshot('result of find all without userId');
    });
  });

  describe('findById', () => {
    it('call find by id', async () => {
      mockingoose(lineModel).toReturn(doc, 'findOne');
      const line = await linesService.findById(doc._id);
      expect(line.toObject()).toMatchSnapshot('result of find by id');
    });
  });

  describe('createLine', () => {
    it('call create line - no error', async () => {
      mockingoose(lineModel).toReturn(doc, 'save');
      const line = await linesService.createLine(docToCreate);
      expect(transactionsService.createTransaction).toHaveBeenCalledWith(
        TransactionTypeEnum.line,
        null,
        expect.objectContaining(doc),
      );
      expect(line.toObject()).toMatchSnapshot(
        'result after the creation of the line',
      );
    });

    it('call create line - with error', async () => {
      mockingoose(lineModel).toReturn(new Error('My Error'), 'save');
      await expect(linesService.createLine(docToCreate)).rejects.toThrow(
        'My Error',
      );
      expect(transactionsService.createTransaction).not.toHaveBeenCalledWith(
        TransactionTypeEnum.line,
        null,
        expect.objectContaining(doc),
      );
    });
  });

  describe('updateLine', () => {
    it('call update line - no error', async () => {
      mockingoose(lineModel).toReturn(doc, 'findOne');
      const oldLine = await linesService.findById(doc._id);

      mockingoose(lineModel).toReturn(doc, 'save');
      const line = await linesService.updateLine(oldLine, docToCreate);
      expect(transactionsService.createTransaction).toHaveBeenCalledWith(
        TransactionTypeEnum.line,
        expect.objectContaining(doc),
        expect.objectContaining(doc),
      );
      expect(line.toObject()).toMatchSnapshot('result after updating the line');
    });

    it('call update line - with error', async () => {
      mockingoose(lineModel).toReturn(doc, 'findOne');
      const oldLine = await linesService.findById(doc._id);

      mockingoose(lineModel).toReturn(new Error('My Error'), 'save');
      await expect(
        linesService.updateLine(oldLine, docToCreate),
      ).rejects.toThrow('My Error');
      expect(transactionsService.createTransaction).not.toHaveBeenCalledWith(
        TransactionTypeEnum.line,
        expect.objectContaining(doc),
        expect.objectContaining(doc),
      );
    });
  });

  describe('removeLine', () => {
    it('call remove line - no error', async () => {
      mockingoose(lineModel).toReturn(doc, 'deleteOne');
      await linesService.removeLine(doc._id);
      expect(transactionsService.createTransaction).toHaveBeenCalledWith(
        TransactionTypeEnum.line,
        expect.objectContaining(doc),
        null,
      );
    });

    it('call remove line - with error', async () => {
      mockingoose(lineModel).toReturn(new Error('My Error'), 'deleteOne');
      await expect(linesService.removeLine(doc._id)).rejects.toThrow(
        'My Error',
      );
      expect(transactionsService.createTransaction).not.toHaveBeenCalledWith(
        TransactionTypeEnum.line,
        expect.objectContaining(doc),
        null,
      );
    });
  });

  describe('getGroups', () => {
    it('call get groups', async () => {
      const groups = ['group1', 'group2', 'group3'];
      mockingoose(lineModel).toReturn(groups, 'distinct');
      expect(await linesService.getGroups('userId')).toMatchSnapshot(
        'result for getting groups',
      );
    });
  });
});
