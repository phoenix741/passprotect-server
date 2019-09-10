import { registerEnumType } from 'type-graphql';

export enum TransactionTypeEnum {
  line = 'line',
}

registerEnumType(TransactionTypeEnum, {
  name: 'TransactionTypeEnum',
  description: 'Type of transaction',
});
