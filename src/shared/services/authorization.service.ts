import { Injectable } from '@nestjs/common';
import { AuthenticatedUser } from '../../shared/interfaces/authentification-user.interface';

@Injectable()
export class AuthorizationService {
  /**
   * Check permission of the user based on the role given
   * @param {Object} user User used to check permission
   * @param {String} userId User ID to compare to the user
   */
  checkPermission(user?: AuthenticatedUser, userId?: string) {
    if (user) {
      if (userId && userId !== user._id) {
        throw new Error('The user isn\'t authorized to view this resource');
      }
    } else {
      throw new Error('The user should be authentified to view this resource');
    }
  }
}
