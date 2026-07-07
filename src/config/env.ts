import dotenv from "dotenv";
dotenv.config();

const required = (key: string, fallback?: string): string => {
  const value = process.env[key] ?? fallback;
  if (value === undefined) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
};

export const env = {
  nodeEnv: required("NODE_ENV", "development"),
  port: Number(required("PORT", "5000")),

  mongoUri: required("MONGO_URI"),

  jwt: {
    accessSecret: required("JWT_ACCESS_SECRET"),
    refreshSecret: required("JWT_REFRESH_SECRET"),
    accessExpiresIn: required("JWT_ACCESS_EXPIRES_IN", "55m"),
    refreshExpiresIn: required("JWT_REFRESH_EXPIRES_IN", "7d"),
  },

  cloudinary: {
    cloudName: required("CLOUDINARY_CLOUD_NAME"),
    apiKey: required("CLOUDINARY_API_KEY"),
    apiSecret: required("CLOUDINARY_API_SECRET"),
  },

  clientUrl: required("CLIENT_URL", "http://localhost:5173"),

  admin: {
    name: required("ADMIN_NAME", "Super Admin"),
    email: required("ADMIN_EMAIL", "admin@miniERP.com"),
    password: required("ADMIN_PASSWORD", "Admin@12345"),
  },
};
