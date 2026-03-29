const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function updateAdmissionNumbers() {
  console.log('📝 Updating students with missing admission numbers...\n');
  
  // Get all students
  const students = await prisma.student.findMany({
    include: {
      user: true
    }
  });
  
  let updatedCount = 0;
  let skippedCount = 0;
  
  for (let i = 0; i < students.length; i++) {
    const student = students[i];
    
    // Skip if already has an admission number
    if (student.admissionNo && student.admissionNo !== 'N/A') {
      console.log('⏭️ Skipping ' + (student.user?.name || 'Unknown') + ' - already has admission number: ' + student.admissionNo);
      skippedCount++;
      continue;
    }
    
    // Generate a unique admission number
    // Format: STU + year + sequential number
    const year = new Date(student.createdAt || Date.now()).getFullYear().toString().slice(-2);
    const sequentialNumber = String(i + 1).padStart(4, '0');
    const admissionNo = 'STU' + year + sequentialNumber;
    
    // Update the student
    await prisma.student.update({
      where: { id: student.id },
      data: { admissionNo: admissionNo }
    });
    
    console.log('✅ Updated ' + (student.user?.name || 'Unknown') + ' - New Admission No: ' + admissionNo);
    updatedCount++;
  }
  
  console.log('\n📊 Summary:');
  console.log('   Updated: ' + updatedCount + ' students');
  console.log('   Skipped: ' + skippedCount + ' students');
  console.log('   Total: ' + students.length + ' students');
  
  // Show all students after update
  console.log('\n📋 All students after update:');
  const allStudents = await prisma.student.findMany({
    include: { user: true }
  });
  
  allStudents.forEach(function(s) {
    console.log('   ' + (s.user?.name || 'Unknown') + ': ' + (s.admissionNo || 'N/A'));
  });
}

updateAdmissionNumbers()
  .catch(console.error)
  .finally(function() {
    prisma.$disconnect();
  });