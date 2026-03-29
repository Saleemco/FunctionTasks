const { PrismaClient } = require('@prisma/client');

async function checkModels() {
  console.log('Checking Prisma Client...');
  
  try {
    const prisma = new PrismaClient();
    console.log('✅ Prisma Client instantiated');
    
    // List all available properties on prisma
    const allProps = Object.keys(prisma);
    const modelProps = allProps.filter(key => 
      !key.startsWith('_') && 
      !['$connect', '$disconnect', '$executeRaw', '$queryRaw', '$transaction', '$on', '$use', '$extends'].includes(key)
    );
    
    console.log('📊 Available models:', modelProps);
    
    if (modelProps.includes('user')) {
      console.log('✅ User model is available');
    } else {
      console.log('❌ User model is NOT available');
    }
    
    await prisma.$disconnect();
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkModels();