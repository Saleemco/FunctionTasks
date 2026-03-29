const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function assignSubjectsAndClasses() {
  console.log('📚 Assigning subjects and classes to teachers...\n');
  
  // Get all teachers
  const teachers = await prisma.teacher.findMany({
    include: { user: true }
  });
  
  // Get all classes
  const classes = await prisma.class.findMany();
  
  // Get all subjects
  const subjects = await prisma.subject.findMany();
  
  console.log('Teachers found: ' + teachers.length);
  console.log('Classes found: ' + classes.length);
  console.log('Subjects found: ' + subjects.length);
  console.log('');
  
  for (const teacher of teachers) {
    console.log('========================================');
    console.log('Teacher: ' + teacher.user?.name);
    console.log('Email: ' + teacher.user?.email);
    console.log('');
    
    // Assign classes based on teacher name or email
    let assignedClasses = [];
    let assignedSubjects = [];
    
    // Example: Assign classes based on teacher name
    if (teacher.user?.name.includes('Anna') || teacher.user?.email.includes('ahmadi')) {
      // Assign JSS classes to Anna
      assignedClasses = classes.filter(c => c.name.includes('JSS'));
      // Assign core subjects
      assignedSubjects = subjects.filter(s => 
        ['Mathematics', 'English Studies', 'Basic Science'].includes(s.name)
      );
      console.log('📚 Assigning JSS classes and core subjects to Anna Sol');
    } 
    else if (teacher.user?.name.includes('oyedele')) {
      // Assign SSS classes to oyedele
      assignedClasses = classes.filter(c => c.name.includes('SSS'));
      // Assign science subjects
      assignedSubjects = subjects.filter(s => 
        ['Physics', 'Chemistry', 'Biology', 'Mathematics'].includes(s.name)
      );
      console.log('📚 Assigning SSS classes and science subjects to oyedele ayomide');
    }
    else if (teacher.user?.name.includes('test')) {
      // Assign all classes to test teacher
      assignedClasses = classes;
      // Assign all subjects
      assignedSubjects = subjects;
      console.log('📚 Assigning all classes and subjects to test teacher');
    }
    
    // Assign classes to teacher
    if (assignedClasses.length > 0) {
      await prisma.teacher.update({
        where: { id: teacher.id },
        data: {
          classes: {
            connect: assignedClasses.map(c => ({ id: c.id }))
          }
        }
      });
      console.log('  ✅ Assigned ' + assignedClasses.length + ' classes: ' + assignedClasses.map(c => c.name).join(', '));
    } else {
      console.log('  ⚠️ No classes assigned');
    }
    
    // Assign subjects to teacher
    if (assignedSubjects.length > 0) {
      // Update subjects to have this teacher
      for (const subject of assignedSubjects) {
        await prisma.subject.update({
          where: { id: subject.id },
          data: { teacherId: teacher.id }
        });
      }
      
      // Also connect through teacher-subject relation
      await prisma.teacher.update({
        where: { id: teacher.id },
        data: {
          subjects: {
            connect: assignedSubjects.map(s => ({ id: s.id }))
          }
        }
      });
      console.log('  ✅ Assigned ' + assignedSubjects.length + ' subjects: ' + assignedSubjects.map(s => s.name).join(', '));
    } else {
      console.log('  ⚠️ No subjects assigned');
    }
    
    console.log('');
  }
  
  console.log('========================================');
  console.log('✅ All assignments completed!');
  console.log('');
  
  // Verify assignments
  const updatedTeachers = await prisma.teacher.findMany({
    include: {
      user: true,
      classes: true,
      subjects: true
    }
  });
  
  console.log('📊 Final Assignments:');
  for (const teacher of updatedTeachers) {
    console.log('\n' + teacher.user?.name + ':');
    console.log('  Classes: ' + (teacher.classes.map(c => c.name).join(', ') || 'None'));
    console.log('  Subjects: ' + (teacher.subjects.map(s => s.name).join(', ') || 'None'));
  }
  
  await prisma.$disconnect();
}

assignSubjectsAndClasses().catch(console.error);