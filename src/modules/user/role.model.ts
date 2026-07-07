import { Schema, model, Document } from "mongoose";
import { PermissionAction } from "../../types";

export interface IRole extends Document {
  name: string; // e.g. 'Admin', 'Manager', 'Employee' — or any custom role
  permissions: PermissionAction[];
  isSystemRole: boolean; // prevents deletion of seeded core roles
  createdAt: Date;
  updatedAt: Date;
}

const roleSchema = new Schema<IRole>(
  {
    name: { type: String, required: true, unique: true, trim: true },
    permissions: [{ type: String, required: true }],
    isSystemRole: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export const RoleModel = model<IRole>("Role", roleSchema);

// Default permission sets used by the seeder — DB-driven, editable at runtime by Admin
export const DEFAULT_ROLE_PERMISSIONS: Record<string, PermissionAction[]> = {
  Admin: [
    "product:create",
    "product:read",
    "product:update",
    "product:delete",
    "customer:create",
    "customer:read",
    "customer:update",
    "customer:delete",
    "sale:create",
    "sale:read",
    "dashboard:read",
    "role:manage",
  ],
  Manager: [
    "product:create",
    "product:read",
    "product:update",
    "product:delete",
    "customer:create",
    "customer:read",
    "customer:update",
    "customer:delete",
    "sale:create",
    "sale:read",
    "dashboard:read",
  ],
  Employee: [
    "product:read",
    // customer:read is required (not create/update/delete) so Employees can pick
    // an existing customer while creating a sale.
    "customer:read",
    "sale:create",
    "sale:read",
    "dashboard:read",
  ],
};
