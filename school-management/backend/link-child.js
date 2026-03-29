const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function linkChild() {
  try {
    // Use the student ID from the previous step
    const studentId = 'cmn1zsj200002ofo04yt53n9f';
    
    // Get parent
    const parent = await prisma.parent.findFirst({
      where: { user: { email: 'parent@example.com' } },
      include: { user: true }
    });
    
    if (!parent) {
      console.log('Parent profile not found');
      return;
    }
    console.log('✅ Parent found:', parent.user?.name);
    
    // Check student
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: { user: true }
    });
    
    if (!student) {
      console.log('❌ Student not found');
      return;
    }
    console.log('✅ Student found:', student.user?.name);
    
    if (student.parentId) {
      console.log('⚠️ Student already has a parent');
      return;
    }
    
    // Link
    const updated = await prisma.student.update({
      where: { id: studentId },
      data: { parentId: parent.id },
      include: { user: true }
    });
    
    console.log('🎉 Successfully linked:', updated.user?.name);
    console.log('Parent ID:', parent.id);
    console.log('Student ID:', updated.id);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

linkChild();