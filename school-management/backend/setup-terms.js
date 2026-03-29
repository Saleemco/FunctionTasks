const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    console.log('📚 Creating academic session and terms...');
    
    // Create academic session
    const session = await prisma.academicSession.create({
      data: {
        year: '2024-2025',
        isActive: true,
        startDate: new Date('2024-09-01'),
        endDate: new Date('2025-06-30'),
      }
    });
    console.log('✅ Academic session created. ID:', session.id);

    // Create FIRST term
    const term1 = await prisma.termInfo.create({
      data: {
        name: 'FIRST',
        sessionId: session.id,
        isActive: true,
        startDate: new Date('2024-09-01'),
        endDate: new Date('2024-12-20'),
      }
    });
    console.log('✅ FIRST Term created. ID:', term1.id);

    // Create SECOND term
    const term2 = await prisma.termInfo.create({
      data: {
        name: 'SECOND',
        sessionId: session.id,
        isActive: false,
        startDate: new Date('2025-01-10'),
        endDate: new Date('2025-04-05'),
      }
    });
    console.log('✅ SECOND Term created. ID:', term2.id);

    // Create THIRD term
    const term3 = await prisma.termInfo.create({
      data: {
        name: 'THIRD',
        sessionId: session.id,
        isActive: false,
        startDate: new Date('2025-04-15'),
        endDate: new Date('2025-06-30'),
      }
    });
    console.log('✅ THIRD Term created. ID:', term3.id);
    
    console.log('\n🎉 Setup complete!');
    console.log('=================================');
    console.log('Use this Term ID for fees:', term1.id);
    console.log('=================================');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();