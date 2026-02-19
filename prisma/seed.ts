import { PrismaClient } from "@prisma/client";
import { createHash } from "crypto";

const prisma = new PrismaClient();

// Hash function using Node.js crypto module
function hashPassword(password: string): string {
  const hash = createHash("sha256");
  hash.update(password + "ava-secret-salt");
  return hash.digest("hex");
}

async function main() {
  // Hash passwords
  const adminPasswordHash = hashPassword("admin123");
  const userPasswordHash = hashPassword("user123");

  const admin = await prisma.user.upsert({
    where: { email: "admin@university.edu" },
    update: {},
    create: {
      name: "Admin User",
      email: "admin@university.edu",
      password: adminPasswordHash,
      role: "ADMIN",
    },
  });

  const user = await prisma.user.upsert({
    where: { email: "user@company.com" },
    update: {},
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
