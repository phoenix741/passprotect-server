import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { LineToCreate, LineToUpdate } from './models/line.models';
import { LineEntity } from './models/line.entity';
import { ObjectID } from 'bson';
import { TransactionsService } from '../transactions/transactions.service';
import { TransactionEntity } from '../transactions/models/transaction.entity';
import { TransactionTypeEnum } from '../shared/interfaces/transaction-type-enum.interface';

interface IFindAllFilter {
  user?: string;
}

@Injectable()
export class LinesService {
  constructor(
    @InjectModel('Line') private readonly lineModel: Model<LineEntity>,
    private readonly transactionService: TransactionsService,
  ) {}

  async findAll(userId: string): Promise<LineEntity[]> {
    if (userId) {
      const filter: IFindAllFilter = { user: userId };
      const sort = { group: 1, label: 1 };
      return await this.lineModel
        .find(filter)
        .sort(sort)
        .exec();
    }
    return [];
  }

  async findById(id: ObjectID) {
    return await this.lineModel.findById(id);
  }

  async createLine(line: LineToCreate): Promise<LineEntity> {
    const lineToCreate = new this.lineModel(line);
    const newLine = await lineToCreate.save();
    await this.transactionService.createTransaction(
      TransactionTypeEnum.line,
      null,
      newLine,
    );
    return newLine;
  }

  async updateLine(
    originalLine: LineEntity,
    line: LineToUpdate,
  ): Promise<LineEntity> {
    const { _id, ...cleanLine } = line;

    const oldLine = new this.lineModel(originalLine.toObject());
    originalLine.set(cleanLine);
    const newLine = await originalLine.save();

    await this.transactionService.createTransaction(
      TransactionTypeEnum.line,
      oldLine,
      newLine,
    );
    return newLine;
  }

  async removeLine(id: ObjectID): Promise<TransactionEntity> {
    const oldLine = await this.lineModel.findById(id);
    await this.lineModel.deleteOne({ _id: id });
    return this.transactionService.createTransaction(
      TransactionTypeEnum.line,
      oldLine,
      null,
    );
  }

  async getGroups(userId: string): Promise<string[]> {
    const filter = { user: userId };
    return this.lineModel.distinct('group', filter);
  }
}
