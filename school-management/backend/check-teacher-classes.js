const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkTeacherClasses() {
  const teachers = await prisma.teacher.findMany({
    include: {
      user: true,
      classes: true,
      subjects: true
    }
  });

  console.log('Teachers and their assignments:\n');
  teachers.forEach(t => {
    const teacherName = t.user?.name || 'Unknown';
    const teacherEmail = t.user?.email || 'No email';
    const classesList = t.classes.map(c => c.name).join(', ') || 'None';
    const subjectsList = t.subjects.map(s => s.name).join(', ') || 'None';
    
    console.log('Teacher: ' + teacherName + ' (' + teacherEmail + ')');
    console.log('  Classes: ' + classesList);
    console.log('  Subjects: ' + subjectsList);
    console.log('');
  });

  await prisma.$disconnect();
}

checkTeacherClasses();