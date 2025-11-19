import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// Ensure required environment variables are set
if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set in environment variables');
}

async function main() {
  // Hash password function
  const hashPassword = async (password: string): Promise<string> => {
    const saltRounds = 10;
    return await bcrypt.hash(password, saltRounds);
  };

  // Create seed data for User table (merged auth and user data)
  const userData = [
    {
      id: 'c7b3d8e0-5e0b-11eb-ae93-0242ac130002',
      username: 'superadmin',
      email: 'maulanayusuf.ena@gmail.com',
      phone: '081317897551',
      password: await hashPassword('password123'),
      role: 'super_admin',
      first_name: 'Super',
      last_name: 'Admin',
      status: 'active',
    },
    // {
    //   id: 'c7b3d8e0-5e0b-11eb-ae93-0242ac130003',
    //   username: 'user1',
    //   email: 'user1@example.com',
    //   phone: '081234567891',
    //   password: await hashPassword('password123'),
    //   role: 'user',
    //   first_name: 'John',
    //   last_name: 'Doe',
    //   status: 'active',
    // },
    // {
    //   id: 'c7b3d8e0-5e0b-11eb-ae93-0242ac130004',
    //   username: 'user2',
    //   email: 'user2@example.com',
    //   phone: '081234567892',
    //   password: await hashPassword('password123'),
    //   role: 'user',
    //   first_name: 'Jane',
    //   last_name: 'Smith',
    //   status: 'active',
    // },
  ];

  // Create User records
  for (const user of userData) {
    await prisma.user.upsert({
      where: { username: user.username },
      update: user,
      create: user,
    });
  }

  console.log('Auth seed data created successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });