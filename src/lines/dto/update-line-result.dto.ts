import { createUnionType } from 'type-graphql';
import { Errors } from '../../shared/dto/errors.dto';
import { WalletLine } from './wallet-line.dto';

export const UpdateLineResultUnion = createUnionType({
  name: 'UpdateLineResult',
  description: 'Result of creation or update of the line',
  types: [WalletLine, Errors],
  resolveType: (obj: WalletLine | Errors): string => {
    const hasError = (tbd: WalletLine | Errors): tbd is Errors => !!(tbd as Errors).errors;
    if (hasError(obj)) {
      return 'Errors';
    }
    return 'WalletLine';
  },
});

export type UpdateLineResult = typeof UpdateLineResultUnion;
