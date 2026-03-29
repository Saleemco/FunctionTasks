const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seedTerms() {
  console.log('Seeding terms...');
  
  const terms = [
    {
      name: 'First Term 2024-2025',
      academicYear: '2024-2025',
      startDate: new Date('2024-09-01'),
      endDate: new Date('2024-12-15'),
      isActive: true
    },
    {
      name: 'Second Term 2024-2025',
      academicYear: '2024-2025',
      startDate: new Date('2025-01-10'),
      endDate: new Date('2025-04-05'),
      isActive: false
    },
    {
      name: 'Third Term 2024-2025',
      academicYear: '2024-2025',
      startDate: new Date('2025-04-20'),
      endDate: new Date('2025-07-20'),
      isActive: false
    }
  ];

  for (const term of terms) {
    try {
      const existing = await prisma.term.findFirst({
        where: {
          name: term.name,
          academicYear: term.academicYear
        }
      });
      
      if (!existing) {
        await prisma.term.create({ data: term });
        console.log(`✅ Created term: ${term.name}`);
      } else {
        console.log(`⏭️ Term already exists: ${term.name}`);
      }
    } catch (error) {
      console.error(`❌ Error creating term ${term.name}:`, error.message);
    }
  }
}

seedTerms()
  .catch(console.error)
  .finally(() => prisma.$disconnect());