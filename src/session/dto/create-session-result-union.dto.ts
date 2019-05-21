import { createUnionType } from 'type-graphql';
import { Errors } from '../../shared/dto/errors.dto';
import { ConnectionInformation } from './connection-information.dto';

export const CreateSessionResultUnion = createUnionType({
  name: 'CreateSessionResult',
  types: [ConnectionInformation, Errors],
  resolveType: (obj: ConnectionInformation | Errors): string => {
    const hasError = (tbd: ConnectionInformation | Errors): tbd is Errors => !!(tbd as Errors).errors;
    if (hasError(obj)) {
      return 'Errors';
    }
    return 'ConnectionInformation';
  },
});

export type CreateSessionResult = typeof CreateSessionResultUnion;
