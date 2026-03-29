const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function getTeacherId() {
  const teacher = await prisma.teacher.findFirst({
    where: { user: { email: 'alam@gmail.com' } }
  });
  
  if (teacher) {
    console.log(teacher.id);
  } else {
    console.log('NOT_FOUND');
  }
  
  await prisma.$disconnect();
}

getTeacherId();
