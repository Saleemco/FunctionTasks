const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function listStudents() {
  try {
    const students = await prisma.student.findMany({
      include: { 
        user: true,
        class: true 
      }
    });
    
    console.log('📚 Students in database:');
    console.log('=====================================');
    
    if (students.length === 0) {
      console.log('No students found.');
    } else {
      students.forEach(s => {
        console.log('ID: ' + s.id);
        console.log('Name: ' + s.user.firstName + ' ' + s.user.lastName);
        console.log('Admission: ' + s.admissionNo);
        console.log('Class: ' + (s.class ? s.class.name + ' ' + (s.class.section || '') : 'Not assigned'));
        console.log('Parent ID: ' + (s.parentId || 'None'));
        console.log('-------------------------------------');
      });
      console.log('Total students: ' + students.length);
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

listStudents();