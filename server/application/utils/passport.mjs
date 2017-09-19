import passport from 'passport'
export {default as permission} from 'permission'

export function authenticate () {
  return passport.authenticate(['authHeader', 'cookie', 'anonymous'], {session: false})
}

/**
 * Check permission of the user based on the role given
 * @param {Object} user User used to check permission
 * @param {Array.<String>} roles List of authorized roles
 * @param {String} userId User ID to compare to the user
 */
export function checkPermission (user, roles, userId) {
  if (user && !user.role) {
    throw new Error('User doesn\'t have property named role')
  }

  if (user) {
    if (roles && roles.indexOf(user.role) <= -1 && !(userId && userId === user._id)) {
      throw new Error('The user isn\'t authorized to view this resource')
    }
  } else {
    throw new Error('The user should be authentified to view this resource')
  }
}
