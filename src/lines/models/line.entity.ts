import { Document } from 'mongoose';
import { EncryptedContent } from '../../shared/interfaces/encrypted-content.interface';
import { LineTypeEnum } from '../../shared/interfaces/line-type-enum.interface';
import { ObjectID } from 'bson';

export interface LineEntity extends Document {
  _id: ObjectID;
  type: LineTypeEnum;
  label: string;
  group: string;
  logo?: Buffer;
  encryption: EncryptedContent;
  user: string;
  createdAt: Date;
  updatedAt: Date;
  _rev: number;
}
