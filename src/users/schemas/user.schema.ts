import * as mongoose from 'mongoose';
import { UserEntity } from '../../users/models/user.entity';

export const UserSchema = new mongoose.Schema<UserEntity>(
  {
    _id: { type: String, required: true, lowercase: true },
    password: { type: String, required: true },
    encryption: {
      salt: Buffer,
      iv: Buffer,
      authTag: Buffer,
      content: Buffer,
    },
  },
  { collection: 'users', timestamps: true },
);

UserSchema.post('init', migrateV1toV2);

export function migrateV1toV2(doc) {
  const encryption: any = doc.get('encryption');
  if (encryption.encryptedKey) {
    doc.set('encryption', {
      salt: encryption.salt,
      iv: null,
      authTag: encryption.encryptedKey.authTag,
      content: encryption.encryptedKey.content,
    });
  }
}
