const { PrismaClient } = require('@prisma/client');

async function createOneUser() {
  console.log('Attempting to create a test user...');
  
  try {
    const prisma = new PrismaClient();
    console.log('✅ Prisma Client created');
    
    const user = await prisma.user.create({
      data: {
        email: 'test@example.com',
        password: 'test123',
        name: 'Test User',
        role: 'ADMIN'
      }
    });
    console.log('✅ User created successfully:', user.email);
    
    await prisma.$disconnect();
  } catch (error) {
    console.error('❌ Error details:', error);
  }
}

createOneUser();