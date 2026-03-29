const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createClasses() {
  console.log('📚 Creating classes if they don\'t exist...\n');
  
  const classes = [
    { name: 'JSS 1', grade: 7 },
    { name: 'JSS 2', grade: 8 },
    { name: 'JSS 3', grade: 9 },
    { name: 'SSS 1', grade: 10 },
    { name: 'SSS 2', grade: 11 },
    { name: 'SSS 3', grade: 12 }
  ];
  
  for (const classData of classes) {
    const existing = await prisma.class.findFirst({
      where: { name: classData.name }
    });
    
    if (!existing) {
      await prisma.class.create({
        data: classData
      });
      console.log(`✅ Created class: ${classData.name} (Grade ${classData.grade})`);
    } else {
      console.log(`⏭️ Class already exists: ${classData.name}`);
    }
  }
  
  console.log('\n📊 All classes in database:');
  const allClasses = await prisma.class.findMany();
  allClasses.forEach(c => {
    console.log(`   - ${c.name} (Grade ${c.grade})`);
  });
}

createClasses()
  .catch(console.error)
  .finally(() => {
    prisma.$disconnect();
  });