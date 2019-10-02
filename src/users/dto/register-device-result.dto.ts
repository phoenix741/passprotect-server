import { createUnionType } from 'type-graphql';
import { Errors } from '../../shared/dto/errors.dto';
import { DeviceToken } from './device-token.dto';

export const RegisterDeviceResultUnion = createUnionType({
  name: 'RegisterDeviceResult',
  description: 'Result of registration of a device',
  types: [DeviceToken, Errors],
  resolveType: (obj: DeviceToken | Errors): string => {
    const hasError = (tbd: DeviceToken | Errors): tbd is Errors => !!(tbd as Errors).errors;
    if (hasError(obj)) {
      return 'Errors';
    }
    return 'DeviceToken';
  },
});

export type RegisterDeviceResult = typeof RegisterDeviceResultUnion;
