import { registerEnumType } from 'type-graphql';

export enum LineTypeEnum {
  card = 'card',
  password = 'password',
  text = 'text',
}

registerEnumType(LineTypeEnum, {
  name: 'LineTypeEnum',
  description: 'Type of line accepted in the wallet',
});
