import { createUnionType } from 'type-graphql';
import { Errors } from '../../shared/dto/errors.dto';
import { User } from './user.dto';

export const RegisterUserResultUnion = createUnionType({
  name: 'RegisterUserResult',
  description: 'Result of registered user',
  types: [User, Errors],
  resolveType: (obj: User | Errors): string => {
    const hasError = (tbd: User | Errors): tbd is Errors => !!(tbd as Errors).errors;
    if (hasError(obj)) {
      return 'Errors';
    }
    return 'User';
  },
});

export type RegisterUserResult = typeof RegisterUserResultUnion;
