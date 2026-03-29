
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  console.log('📚 ALL CLASSES:');
  const classes = await prisma.class.findMany();
  classes.forEach(c => console.log('  - ' + c.name + ' (ID: ' + c.id + ')'));
  
  console.log('\n👨‍🏫 ALL TEACHERS:');
  const teachers = await prisma.teacher.findMany({
    include: { user: true, classes: true }
  });
  teachers.forEach(t => {
    const teacherName = t.user?.name || 'Unknown';
    const teacherEmail = t.user?.email || 'No email';
    const assignedClasses = t.classes.map(c => c.name).join(', ') || 'NONE';
    console.log('  - ' + teacherName + ' (' + teacherEmail + ')');
    console.log('    Assigned classes: ' + assignedClasses);
  });
  
  await prisma.$disconnect();
}

check();
