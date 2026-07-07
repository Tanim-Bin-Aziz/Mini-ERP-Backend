export type PermissionAction =
  | 'product:create'
  | 'product:read'
  | 'product:update'
  | 'product:delete'
  | 'customer:create'
  | 'customer:read'
  | 'customer:update'
  | 'customer:delete'
  | 'sale:create'
  | 'sale:read'
  | 'dashboard:read'
  | 'role:manage';

export interface JwtPayload {
  userId: string;
  role: string; // role name — resolved to permissions via DB (dynamic roles)
  tokenVersion: number;
}

export interface AuthenticatedUser {
  _id: string;
  name: string;
  email: string;
  role: string;
  permissions: PermissionAction[];
}
