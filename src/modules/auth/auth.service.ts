import { UserModel } from '../user/user.model';
import { RoleModel } from '../user/role.model';
import { ApiError } from '../../utils/ApiError';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../../utils/jwt';
import { LoginInput } from './auth.validation';

export const AuthService = {
  async login(input: LoginInput) {
    const user = await UserModel.findOne({ email: input.email }).select('+password');
    if (!user || !user.isActive) {
      throw ApiError.unauthorized('Invalid email or password');
    }

    const isMatch = await user.comparePassword(input.password);
    if (!isMatch) {
      throw ApiError.unauthorized('Invalid email or password');
    }

    const role = await RoleModel.findOne({ name: user.role });
    if (!role) {
      throw ApiError.forbidden('Role no longer exists — contact an administrator');
    }

    const payload = { userId: user._id.toString(), role: user.role, tokenVersion: user.tokenVersion };
    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);

    return {
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        permissions: role.permissions,
      },
    };
  },

  async refresh(token: string) {
    let decoded;
    try {
      decoded = verifyRefreshToken(token);
    } catch {
      throw ApiError.unauthorized('Invalid or expired refresh token');
    }

    const user = await UserModel.findById(decoded.userId);
    if (!user || !user.isActive || user.tokenVersion !== decoded.tokenVersion) {
      throw ApiError.unauthorized('Session invalid, please log in again');
    }

    const payload = { userId: user._id.toString(), role: user.role, tokenVersion: user.tokenVersion };
    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);

    return { accessToken, refreshToken };
  },

  async logout(userId: string) {
    // Bump tokenVersion to invalidate all previously issued tokens
    await UserModel.findByIdAndUpdate(userId, { $inc: { tokenVersion: 1 } });
  },

  async me(userId: string) {
    const user = await UserModel.findById(userId);
    if (!user) throw ApiError.notFound('User not found');
    const role = await RoleModel.findOne({ name: user.role });
    return {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      permissions: role?.permissions ?? [],
    };
  },
};
