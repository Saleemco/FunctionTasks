const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Working!');
  const users = await prisma.user.findMany();
  console.log(users);
}

main().finally(() => prisma.$disconnect());