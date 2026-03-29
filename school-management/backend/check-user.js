const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkUser() {
  const user = await prisma.user.findUnique({
    where: { id: 'cmn836h430003of8gyzmanfw4' }
  });
  
  if (user) {
    console.log('User found:');
    console.log('  ID: ' + user.id);
    console.log('  Name: ' + user.name);
    console.log('  Email: ' + user.email);
    console.log('  Role: ' + user.role);
    
    // Check if there's a teacher profile for this user
    const teacher = await prisma.teacher.findUnique({
      where: { userId: user.id }
    });
    
    if (teacher) {
      console.log('  Teacher Profile: YES');
    } else {
      console.log('  Teacher Profile: NO');
    }
  } else {
    console.log('User not found');
  }
  
  await prisma.$disconnect();
}

checkUser();