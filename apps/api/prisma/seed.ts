import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient({
  adapter: new PrismaPg({
    connectionString: process.env.DATABASE_URL!,
  }),
});

async function main() {
  console.log('SEEDING || STARTED');

  const adminEmail = 'admin.nuvora@gmail.com';
  const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } });

  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash('Admin123!', 10);
    await prisma.user.create({
      data: {
        name: 'Admin',
        email: adminEmail,
        password: hashedPassword,
        role: Role.ADMIN,
        emailVerified: true,
        isActive: true,
      },
    });
    console.log('ADMIN || CREATED || SUCCESS');
  } else {
    console.log('ADMIN || EXISTS || SKIPPED');
  }

  const normalEmail = 'johndoe@gmail.com';
const existingNormal = await prisma.user.findUnique({ where: { email: normalEmail } });

if (!existingNormal) {
  const hashedPassword = await bcrypt.hash('User123!', 10);
  await prisma.user.create({
    data: {
      name: 'John Doe',
      email: normalEmail,
      password: hashedPassword,
      role: Role.USER,
      emailVerified: true,
      isActive: true,
    },
  });
  console.log('USER || CREATED || SUCCESS');
} else {
  console.log('USER || EXISTS || SKIPPED');
}

  console.log('SEEDING || COMPLETE');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
