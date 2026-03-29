const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkParents() {
  try {
    const parents = await prisma.parent.findMany({
      include: { user: true }
    });
    console.log('Parents in database:');
    if (parents.length === 0) {
      console.log('No parents found');
    } else {
      parents.forEach(p => {
        console.log(`ID: ${p.id}, User: ${p.user?.name}, Email: ${p.user?.email}`);
      });
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkParents();