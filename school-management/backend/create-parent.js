const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  try {
    // Create parent user
    const user = await prisma.user.create({
      data: {
        email: 'parent@school.com',
        password: bcrypt.hashSync('parent123', 10),
        firstName: 'Parent',
        lastName: 'User',
        role: 'PARENT',
        isActive: true
      }
    });
    console.log('✅ Parent user created with ID:', user.id);

    // Create parent profile
    const parent = await prisma.parent.create({
      data: {
        userId: user.id,
        occupation: 'Engineer',
        address: '123 School Road',
        phone: '+234800000000'
      }
    });
    console.log('✅ Parent profile created with ID:', parent.id);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();