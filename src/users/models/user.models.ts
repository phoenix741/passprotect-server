import { EncryptedContent } from '../../shared/interfaces/encrypted-content.interface';

export interface UserToRegister {
  _id: string;
  password: string;
  encryption: EncryptedContent;
}

export interface JwtPayload {
  sub: string;
  issuer: string;
}
