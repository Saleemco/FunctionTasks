const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  try {
    const parents = await prisma.parent.findMany({
      include: {
        user: true,
        children: {
          include: { user: true }
        }
      }
    });
    
    console.log('All parents in system:');
    console.log('=======================');
    
    if (parents.length === 0) {
      console.log('No parents found');
    } else {
      for (let i = 0; i < parents.length; i++) {
        const p = parents[i];
        console.log('\nParent ' + (i + 1) + ': ' + p.user.firstName + ' ' + p.user.lastName + ' (' + p.user.email + ')');
        console.log('Children: ' + p.children.length);
        for (let j = 0; j < p.children.length; j++) {
          const c = p.children[j];
          console.log('  - ' + c.user.firstName + ' ' + c.user.lastName + ' (Admission: ' + c.admissionNo + ')');
        }
      }
    }
    
    console.log('\n=======================');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

check();