import { Document } from 'mongoose';
import { EncryptedContent } from '../../shared/interfaces/encrypted-content.interface';

export interface UserEntity extends Document {
  _id: string;
  password: string;
  encryption: EncryptedContent;
  createdAt: Date;
  updatedAt: Date;
}
