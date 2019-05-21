import { Binary } from 'bson';

export interface EncryptedContent {
  salt: Binary | Buffer;
  iv: Binary | Buffer;
  authTag: Binary | Buffer;
  content: Binary | Buffer;
}
