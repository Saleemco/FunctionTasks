const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixTeacherClasses() {
  console.log('🔧 Fixing teacher class assignments...\n');
  
  // Get all teachers
  const teachers = await prisma.teacher.findMany({
    include: {
      user: true,
      classes: true
    }
  });
  
  // Get all classes
  const allClasses = await prisma.class.findMany();
  console.log('Available classes:');
  allClasses.forEach(c => console.log('  - ' + c.name));
  console.log('');
  
  for (const teacher of teachers) {
    const teacherName = teacher.user?.name || 'Unknown';
    const teacherEmail = teacher.user?.email || 'No email';
    const currentClasses = teacher.classes.map(c => c.name).join(', ') || 'None';
    
    console.log('\n📚 Teacher: ' + teacherName + ' (' + teacherEmail + ')');
    console.log('   Current classes: ' + currentClasses);
    
    // Assign classes based on teacher name or email
    let classesToAssign = [];
    
    if (teacherEmail === 'ahmadi@gmail.com' || teacherName.includes('Anna')) {
      // Assign SSS 1 to Anna
      classesToAssign = allClasses.filter(c => c.name === 'SSS 1');
      console.log('   Assigning SSS 1 to this teacher');
    } else if (teacherEmail === 'oyedele@gmail.com') {
      // Assign JSS classes to oyedele
      classesToAssign = allClasses.filter(c => c.name.includes('JSS'));
      console.log('   Assigning JSS classes to this teacher');
    } else {
      // For other teachers, assign all classes
      classesToAssign = allClasses;
      console.log('   Assigning all classes to this teacher');
    }
    
    if (classesToAssign.length > 0 && teacher.classes.length === 0) {
      await prisma.teacher.update({
        where: { id: teacher.id },
        data: {
          classes: {
            connect: classesToAssign.map(c => ({ id: c.id }))
          }
        }
      });
      console.log('   ✅ Assigned ' + classesToAssign.length + ' classes: ' + classesToAssign.map(c => c.name).join(', '));
    } else if (teacher.classes.length > 0) {
      console.log('   ✅ Already has ' + teacher.classes.length + ' classes assigned');
    } else {
      console.log('   ⚠️ No classes to assign');
    }
  }
  
  // Verify after fixes
  console.log('\n📊 VERIFICATION:\n');
  const updatedTeachers = await prisma.teacher.findMany({
    include: {
      user: true,
      classes: true,
      subjects: true
    }
  });
  
  updatedTeachers.forEach(t => {
    const teacherName = t.user?.name || 'Unknown';
    const classesList = t.classes.map(c => c.name).join(', ') || 'None';
    const subjectsList = t.subjects.map(s => s.name).join(', ') || 'None';
    
    console.log(teacherName + ':');
    console.log('  Classes: ' + classesList);
    console.log('  Subjects: ' + subjectsList);
  });
  
  await prisma.$disconnect();
}

fixTeacherClasses();