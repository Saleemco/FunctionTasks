console.log('Test file is working!');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
  console.log('Testing connection...');
  const result = await prisma.\SELECT 1 as test\;
  console.log('Database connection successful:', result);
}

test()
  .catch(console.error)
  .finally(() => prisma.());
