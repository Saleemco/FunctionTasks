const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  try {
    const fees = await prisma.fee.findMany({
      include: {
        student: {
          include: {
            user: true,
            parent: true
          }
        },
        payments: true,
        term: true
      }
    });
    
    console.log('Fees in database:');
    console.log(JSON.stringify(fees, null, 2));
    
    // Also show students with their parents
    const students = await prisma.student.findMany({
      include: {
        user: true,
        parent: {
          include: {
            user: true
          }
        },
        fees: true
      }
    });
    
    console.log('\n\nStudents with parents:');
    students.forEach(s => {
      console.log(`- ${s.user?.name}: Parent = ${s.parent?.user?.name || 'No parent'}, Fees: ${s.fees.length}`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

check();