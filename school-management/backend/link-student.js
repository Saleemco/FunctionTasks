const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function linkStudent() {
  try {
    const parentId = 'efbc4329-92df-4817-bb92-7a35f6bee074';
    const studentId = 'b2c4dd53-92dc-4f02-869f-c7982c7fcf28'; // Saleem Abimbola
    
    console.log('Linking student...');
    console.log('Parent ID:', parentId);
    console.log('Student ID:', studentId);
    
    const updatedStudent = await prisma.student.update({
      where: { id: studentId },
      data: { parentId: parentId }
    });
    
    console.log('✅ Student linked to parent successfully!');
    console.log('Student ID:', updatedStudent.id);
    console.log('Parent ID:', updatedStudent.parentId);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

linkStudent();