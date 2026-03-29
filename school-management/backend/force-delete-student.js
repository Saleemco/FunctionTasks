const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function forceDeleteStudent() {
  const studentId = 'cmn1p6k1u0002ofewsqz7vsa8';
  
  try {
    console.log('🔍 Force deleting student...');
    
    // Get student to get userId
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: { user: true }
    });
    
    if (!student) {
      console.log('❌ Student not found');
      return;
    }
    
    console.log('📊 Student: ' + (student.user?.name || 'Unknown'));
    
    // Get all fees for this student
    const fees = await prisma.fee.findMany({
      where: { studentId: studentId },
      select: { id: true }
    });
    
    console.log('💰 Found ' + fees.length + ' fees');
    
    // Delete payments for each fee
    for (const fee of fees) {
      console.log('   Deleting payments for fee ' + fee.id);
      await prisma.$executeRaw`DELETE FROM "Payment" WHERE "feeId" = ${fee.id}`;
    }
    
    // Delete fee items
    for (const fee of fees) {
      console.log('   Deleting fee items for fee ' + fee.id);
      await prisma.$executeRaw`DELETE FROM "FeeItem" WHERE "feeId" = ${fee.id}`;
    }
    
    // Delete discounts
    for (const fee of fees) {
      console.log('   Deleting discounts for fee ' + fee.id);
      await prisma.$executeRaw`DELETE FROM "Discount" WHERE "feeId" = ${fee.id}`;
    }
    
    // Delete fees
    console.log('   Deleting fees');
    await prisma.$executeRaw`DELETE FROM "Fee" WHERE "studentId" = ${studentId}`;
    
    // Delete attendances
    console.log('   Deleting attendances');
    await prisma.$executeRaw`DELETE FROM "Attendance" WHERE "studentId" = ${studentId}`;
    
    // Delete grades
    console.log('   Deleting grades');
    await prisma.$executeRaw`DELETE FROM "Grade" WHERE "studentId" = ${studentId}`;
    
    // Delete student
    console.log('   Deleting student');
    await prisma.$executeRaw`DELETE FROM "Student" WHERE id = ${studentId}`;
    
    // Delete user
    console.log('   Deleting user');
    await prisma.$executeRaw`DELETE FROM "User" WHERE id = ${student.userId}`;
    
    console.log('✅ Student force deleted successfully!');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

forceDeleteStudent();