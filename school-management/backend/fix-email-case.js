const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fix() {
  console.log('Checking emails for case sensitivity...\n');
  const users = await prisma.user.findMany();
  let count = 0;
  
  for (const user of users) {
    const lowerEmail = user.email.toLowerCase();
    if (user.email !== lowerEmail) {
      console.log('Fixed: ' + user.email + ' -> ' + lowerEmail);
      await prisma.user.update({
        where: { id: user.id },
        data: { email: lowerEmail }
      });
      count++;
    }
  }
  
  if (count === 0) {
    console.log('No emails needed fixing.');
  } else {
    console.log('\nFixed ' + count + ' users');
  }
  await prisma.$disconnect();
}

fix();
