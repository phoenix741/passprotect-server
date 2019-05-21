import { EncryptedContent } from '../../shared/interfaces/encrypted-content.interface';
import { LineTypeEnum } from '../../shared/interfaces/line-type-enum.interface';
import { ObjectID } from 'bson';

export interface LineToCreate {
  label: string;
  type: LineTypeEnum;
  group: string;
  encryption: EncryptedContent;
  user: string;
}

export interface LineToUpdate {
  _id?: ObjectID;
  label: string;
  type: LineTypeEnum;
  group: string;
  encryption: EncryptedContent;
}
