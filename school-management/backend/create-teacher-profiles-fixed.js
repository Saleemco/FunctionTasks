const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createTeacherProfiles() {
  console.log('🔍 Finding users with TEACHER role...\n');
  
  const users = await prisma.user.findMany({
    where: { role: 'TEACHER' }
  });
  
  console.log('Found ' + users.length + ' teachers:\n');
  users.forEach(u => {
    console.log('  - ' + u.email + ' (' + u.name + ')');
  });
  console.log('');
  
  let created = 0;
  let skipped = 0;
  
  for (const user of users) {
    const existingTeacher = await prisma.teacher.findUnique({
      where: { userId: user.id }
    });
    
    if (!existingTeacher) {
      console.log('Creating teacher profile for: ' + user.email);
      try {
        await prisma.teacher.create({
          data: {
            userId: user.id
            // Only use fields that exist in your schema
          }
        });
        console.log('  ✅ Created\n');
        created++;
      } catch (error) {
        console.log('  ❌ Error: ' + error.message + '\n');
      }
    } else {
      console.log('Already exists: ' + user.email + ' (skipping)\n');
      skipped++;
    }
  }
  
  console.log('========================================');
  console.log('SUMMARY:');
  console.log('  Created: ' + created);
  console.log('  Skipped: ' + skipped);
  console.log('========================================\n');
  
  // Verify
  const teachers = await prisma.teacher.findMany({
    include: { user: true }
  });
  
  console.log('📊 Updated teacher profiles (' + teachers.length + '):');
  teachers.forEach(t => {
    console.log('  - ' + t.user?.name + ' (' + t.user?.email + ')');
  });
  
  await prisma.$disconnect();
}

createTeacherProfiles().catch(console.error);
