const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkJSS1Students() {
  // Find JSS 1 class
  const jss1Class = await prisma.class.findFirst({
    where: { name: 'JSS 1' }
  });
  
  if (!jss1Class) {
    console.log('JSS 1 class not found!');
    await prisma.$disconnect();
    return;
  }
  
  console.log('JSS 1 Class ID: ' + jss1Class.id);
  console.log('');
  
  // Get all students in JSS 1
  const students = await prisma.student.findMany({
    where: { classId: jss1Class.id },
    include: {
      user: true,
      class: true
    }
  });
  
  console.log('Students in JSS 1: ' + students.length);
  students.forEach(s => {
    console.log('  - ' + s.user?.name + ' (Admission: ' + s.admissionNo + ')');
  });
  
  if (students.length === 0) {
    console.log('');
    console.log('⚠️ No students found in JSS 1!');
    console.log('Let me check all students in the database:');
    
    const allStudents = await prisma.student.findMany({
      include: {
        user: true,
        class: true
      },
      take: 10
    });
    
    console.log('\nFirst 10 students in database:');
    allStudents.forEach(s => {
      console.log('  - ' + s.user?.name + ' -> Class: ' + (s.class?.name || 'NO CLASS'));
    });
  }
  
  await prisma.$disconnect();
}

checkJSS1Students();