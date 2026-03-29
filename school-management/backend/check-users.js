const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkUsers() {
  const users = await prisma.user.findMany();
  console.log('All users in database:');
  console.log('-----------------------');
  users.forEach(u => {
    console.log(u.email + ' | Role: ' + u.role + ' | Name: ' + u.name);
  });
  console.log('-----------------------');
  console.log('Total users: ' + users.length);
  await prisma.$disconnect();
}