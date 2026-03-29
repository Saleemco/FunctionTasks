const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fix() {
  try {
    await prisma.$executeRaw`ALTER TYPE "GradeType" ADD VALUE IF NOT EXISTS 'CA'`;
    console.log('✅ CA added to GradeType enum successfully!');
  } catch (e) {
    console.log('Error:', e.message);
  }
  await prisma.$disconnect();
}
fix();