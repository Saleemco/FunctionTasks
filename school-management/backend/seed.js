const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Starting to seed database...');

  // Create admin user
  const admin = await prisma.user.create({
    data: {
      email: 'admin@school.com',
      password: 'hashedpassword123',
      name: 'Admin User',
      role: 'ADMIN'
    }
  });
  console.log('Created admin:', admin.email);

  // Create teacher user
  const teacherUser = await prisma.user.create({
    data: {
      email: 'teacher@school.com',
      password: 'hashedpassword123',
      name: 'John Teacher',
      role: 'TEACHER'
    }
  });
  console.log('Created teacher user:', teacherUser.email);

  // Create class
  const class5A = await prisma.class.create({
    data: {
      name: 'Grade 5A',
      grade: 5
    }
  });
  console.log('Created class:', class5A.name);

  // Show all users
  const users = await prisma.user.findMany();
  console.log('Total users:', users.length);
}

main()
  .catch(error => {
    console.error('Error:', error);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });