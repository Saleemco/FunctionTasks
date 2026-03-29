const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createSubjects() {
  try {
    const subjects = [
      'English Studies',
      'Mathematics',
      'Basic Science',
      'Basic Technology',
      'Social Studies',
      'Civic Education',
      'Christian Religious Studies',
      'Islamic Religious Studies',
      'Agricultural Science',
      'Home Economics',
      'Business Studies',
      'French',
      'Computer Studies',
      'Physical & Health Education',
      'Cultural & Creative Arts',
      'English Language',
      'Physics',
      'Chemistry',
      'Biology',
      'Economics',
      'Government',
      'Literature in English',
      'Geography',
      'History',
      'Commerce',
      'Accounting',
      'Islamic Studies',
      'Computer Science',
      'Further Mathematics',
      'Civic Education',
      'Data Processing'
    ];
    
    let created = 0;
    let existed = 0;
    
    console.log('📚 Creating subjects...\n');
    
    for (const name of subjects) {
      const existing = await prisma.subject.findFirst({
        where: { name: name }
      });
      
      if (!existing) {
        await prisma.subject.create({
          data: { name: name }
        });
        console.log('✅ Created: ' + name);
        created++;
      } else {
        console.log('⏭️  Already exists: ' + name);
        existed++;
      }
    }
    
    console.log('\n==================================================');
    console.log('📊 SUMMARY:');
    console.log('   ✅ Subjects created: ' + created);
    console.log('   ⏭️  Subjects already existed: ' + existed);
    console.log('==================================================');
    console.log('\n🎉 Done!');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createSubjects();