import { UserModel, IUser } from "./user.model";
import { RoleModel } from "./role.model";
import { ApiError } from "../../utils/ApiError";

interface CreateUserInput {
  name: string;
  email: string;
  password: string;
  role: string;
}

interface UpdateUserInput {
  name?: string;
  role?: string;
  isActive?: boolean;
  password?: string;
}

// Plain shape returned after stripping the password — deliberately NOT based on
// IUser/Document, since a Mongoose document has 40+ internal methods that a
// plain object (post .toObject()) will never satisfy.
interface SafeUser {
  _id: unknown;
  name: string;
  email: string;
  role: string;
  tokenVersion: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const assertRoleExists = async (roleName: string) => {
  const role = await RoleModel.findOne({ name: roleName });
  if (!role) {
    throw ApiError.badRequest(
      `Role '${roleName}' does not exist. Valid roles are DB-driven — create the role first.`,
    );
  }
};

export const UserService = {
  // Admin-only: this is how Manager/Employee accounts get created since there is
  // no public self-registration flow (spec only requires Login + Protected Routes).
  create: async (input: CreateUserInput): Promise<IUser> => {
    const existing = await UserModel.findOne({ email: input.email });
    if (existing)
      throw ApiError.conflict(`Email '${input.email}' already in use`);

    await assertRoleExists(input.role);

    return UserModel.create(input);
  },

  getAll: async (): Promise<IUser[]> => {
    return UserModel.find().select("-password").sort({ createdAt: -1 });
  },

  getById: async (id: string): Promise<IUser> => {
    const user = await UserModel.findById(id).select("-password");
    if (!user) throw ApiError.notFound("User not found");
    return user;
  },

  update: async (id: string, input: UpdateUserInput): Promise<SafeUser> => {
    const user = await UserModel.findById(id);
    if (!user) throw ApiError.notFound("User not found");

    if (input.role) await assertRoleExists(input.role);

    Object.assign(user, input);
    await user.save();

    const { password: _password, ...safeUser } = user.toObject();
    return safeUser;
  },

  // Soft-deactivate rather than delete — keeps audit trail (who created what) intact
  deactivate: async (id: string): Promise<void> => {
    const user = await UserModel.findById(id);
    if (!user) throw ApiError.notFound("User not found");
    user.isActive = false;
    user.tokenVersion += 1; // invalidates any existing refresh tokens immediately
    await user.save();
  },
};
