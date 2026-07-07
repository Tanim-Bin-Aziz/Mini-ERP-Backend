import { connectDB } from './config/db';
import { RoleModel, DEFAULT_ROLE_PERMISSIONS } from './modules/user/role.model';
import { UserModel } from './modules/user/user.model';
import { env } from './config/env';
import mongoose from 'mongoose';

/**
 * Run with: npx ts-node src/seed.ts
 * Seeds the three default roles (DB-driven, editable later) and one Admin user.
 */
const seed = async () => {
  await connectDB();

  for (const [name, permissions] of Object.entries(DEFAULT_ROLE_PERMISSIONS)) {
    await RoleModel.findOneAndUpdate(
      { name },
      { name, permissions, isSystemRole: true },
      { upsert: true, new: true }
    );
    console.log(`✅ Role ensured: ${name}`);
  }

  const existingAdmin = await UserModel.findOne({ email: env.admin.email });
  if (!existingAdmin) {
    await UserModel.create({
      name: env.admin.name,
      email: env.admin.email,
      password: env.admin.password,
      role: 'Admin',
    });
    console.log(`✅ Admin user created: ${env.admin.email} / ${env.admin.password}`);
  } else {
    console.log('ℹ️  Admin user already exists, skipping creation.');
  }

  await mongoose.disconnect();
  console.log('🌱 Seeding complete.');
};

seed().catch((err) => {
  console.error('❌ Seeding failed:', err);
  process.exit(1);
});
