import { EncryptedContent } from '../../shared/interfaces/encrypted-content.interface';

export enum PayloadScopeEnum {
  REFRESH_TOKEN,
  USER,
}

export interface UserToRegister {
  _id: string;
  password: string;
  encryption: EncryptedContent;
}

export interface JwtPayload {
  sub: string;
  iss: string;
  scope: PayloadScopeEnum;
  device?: string;
}
