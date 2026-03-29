const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Starting user creation...');
    
    const users = [
      { email: 'admin@school.com', password: 'admin123', firstName: 'Ahmad', lastName: 'Abimbola', role: 'ADMIN' },
      { email: 'principal@school.com', password: 'principal123', firstName: 'Salim', lastName: 'Adedeji', role: 'PRINCIPAL' },
      { email: 'bursar@school.com', password: 'bursar123', firstName: 'Lateefat', lastName: 'Abimbola', role: 'BURSAR' },
      { email: 'math.teacher@school.com', password: 'teacher123', firstName: 'Rukayat', lastName: 'Lamina', role: 'SUBJECT_TEACHER' },
      { email: 'parent@example.com', password: 'parent123', firstName: 'Taiwo', lastName: 'Popoola', role: 'PARENT' },
      { email: 'student@example.com', password: 'student123', firstName: 'Aisha', lastName: 'Ismail', role: 'STUDENT' }
    ];

    for (const user of users) {
      const hashedPassword = bcrypt.hashSync(user.password, 10);
      await prisma.user.create({
        data: {
          email: user.email,
          password: hashedPassword,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          isActive: true
        }
      });
      console.log('✓ Created: ' + user.email);
    }
    
    console.log('\n✓ All 6 users created successfully!');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();