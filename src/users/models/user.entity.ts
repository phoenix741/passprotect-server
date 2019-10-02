import { Document } from 'mongoose';
import { EncryptedContent } from '../../shared/interfaces/encrypted-content.interface';

/**
 * Registered device of a user
 */
export interface DeviceEntity {
  /** Name of the device */
  name: string;
  /** Uniq ID of the device */
  id: string;
}

export interface UserEntity extends Document {
  _id: string;
  password: string;
  encryption: EncryptedContent;
  createdAt: Date;
  updatedAt: Date;
  /** Devices of the user, used to register a device and keep connection with it */
  devices: DeviceEntity[];
}
