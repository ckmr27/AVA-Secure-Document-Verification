import { PrismaClient } from "@prisma/client";
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

async function main() {
  const adminPasswordHash = await hashPassword("admin123");
  const userPasswordHash = await hashPassword("user123");

  const admin = await prisma.user.upsert({
    where: { email: "admin@university.edu" },
    update: { password: adminPasswordHash, role: "ADMIN" },
    create: {
      name: "Admin User",
      email: "admin@university.edu",
      password: adminPasswordHash,
      role: "ADMIN",
    },
  });

  const user = await prisma.user.upsert({
    where: { email: "user@company.com" },
    update: { password: userPasswordHash, role: "USER" },
    create: {
      name: "Regular User",
      email: "user@company.com",
      password: userPasswordHash,
      role: "USER",
    },
  });

  const institution = await prisma.institution.upsert({
    where: { name: "Blockchain University" },
    update: {},
    create: {
      name: "Blockchain University",
      blockchainId: "0x1234567890123456789012345678901234567890",
    },
  });

  await prisma.certificate.upsert({
    where: { certCode: "CERT123" },
    update: {},
    create: {
      certCode: "CERT123",
      title: "Blockchain Certificate 123",
      fileHash: "abc123hash",
      ipfsLink: "ipfs://abc123",
      uploadedBy: admin.id,
      institutionId: institution.id,
    },
  });

  console.log("Seed data created successfully");
  console.log("Admin:", admin.email);
  console.log("User:", user.email);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });