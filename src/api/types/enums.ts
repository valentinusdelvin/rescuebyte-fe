// Enum sistem

export enum AuthProvider {
  ProviderLocal = 'LOCAL',
  ProviderGoogle = 'GOOGLE',
}

export type AuthProviderType = 'LOCAL' | 'GOOGLE';

export enum GenderIdx {
  GenderUnknownIdx = 0,
  GenderMaleIdx = 1,
  GenderFemaleIdx = 2,
}

export type GenderIdxType = 0 | 1 | 2;

export enum UserRoleIdx {
  RoleUnknownIdx = 0,
  RoleUserIdx = 1,
  RoleAdminIdx = 2,
  RoleSellerIdx = 3,
}

export type UserRoleIdxType = 0 | 1 | 2 | 3;

export type OrderStatusType =
  | 'MENUNGGU_PEMBAYARAN'
  | 'IN_PROCESS'
  | 'READY_FOR_PICKUP'
  | 'COMPLETED'
  | 'CANCELLED';

export type StoreStatusType = 'ACTIVE' | 'INACTIVE';

export type PaymentMethodType = 'ONLINE' | 'CASH_ON_PICKUP';

export interface EnumsResponse {
  active_statuses?: Record<string, string>;
  genders?: Record<string, string>;
  user_roles?: Record<string, string>;
  [key: string]: unknown;
}
