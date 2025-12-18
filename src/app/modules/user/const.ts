export const Region = {
  north: 'north',
  south: 'south',
  east: 'east',
  west: 'west',
} as const;

export const Roles = {
  ADMIN: 'admin',
  USER: 'user',
  PROVIDER: 'provider',
  USER_PROVIDER_COMMON: 'userProviderCommon',
  COMMON_ADMIN_PROVIDER: 'commonAdminProvider',
  SUPER_ADMIN: 'superAdmin',
  COMMON: 'common',
  COMMON_ADMIN: 'commonAdmin',
} as const;
