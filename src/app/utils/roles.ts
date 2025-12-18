// An application depends on what roles it will have.

export const allRoles = {
  user: ['common', 'user', 'userProviderCommon'],
  provider: ['common', 'provider', 'commonAdminProvider', 'userProviderCommon'],
  admin: ['common', 'commonAdmin', 'admin', 'commonAdminProvider'],
  superAdmin: ['common', 'commonAdmin', 'superAdmin', 'commonAdminProvider'],
};

export const roles = Object.keys(allRoles);
export const roleRights = new Map(Object.entries(allRoles));
