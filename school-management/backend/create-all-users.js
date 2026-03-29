const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createUsers() {
  console.log('Creating users...');
  
  const users = [
    { email: 'principal@school.com', password: 'principal123', name: 'School Principal', role: 'PRINCIPAL' },
    { email: 'admin@school.com', password: 'admin123', name: 'Admin User', role: 'ADMIN' },
    { email: 'bursar@school.com', password: 'bursar123', name: 'School Bursar', role: 'BURSAR' },
    { email: 'math.teacher@school.com', password: 'teacher123', name: 'Math Teacher', role: 'TEACHER' },
    { email: 'parent@example.com', password: 'parent123', name: 'Parent User', role: 'PARENT' },
    { email: 'student@example.com', password: 'student123', name: 'Student User', role: 'STUDENT' }
  ];

  for (const userData of users) {
    try {
      const user = await prisma.user.create({
        data: userData
      });
      console.log('SUCCESS - Created ' + user.role + ': ' + user.email);
    } catch (error) {
      console.log('ERROR - Failed to create ' + userData.email + ': ' + error.message);
    }
  }

  const allUsers = await prisma.user.findMany();
  console.log('\nAll users in database:');
  allUsers.forEach(u => console.log('  - ' + u.role + ': ' + u.email));
}

createUsers()
  .catch(console.error)
  .finally(() => prisma.$disconnect());