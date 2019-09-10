import * as mongoose from 'mongoose';
import { LineEntity } from '../../lines/models/line.entity';

export const LineSchema = new mongoose.Schema<LineEntity>(
  {
    _rev: Number,
    label: { type: String, required: true },
    type: { type: String, required: true, enum: ['card', 'password', 'text'] },
    group: { type: String, required: true },
    logo: Buffer,
    encryption: {
      salt: Buffer,
      iv: Buffer,
      authTag: Buffer,
      content: Buffer,
    },
    user: { type: String, required: true },
  },
  { collection: 'walletlines', timestamps: true, versionKey: '_rev' },
);

LineSchema.post('init', migrateV1toV2);

export function migrateV1toV2(doc: LineEntity) {
  const encryption: any = doc.get('encryption');
  if (encryption.informations) {
    doc.set('encryption', {
      salt: encryption.salt,
      iv: null,
      authTag: encryption.informations.authTag,
      content: encryption.informations.content,
    });
  }
}
