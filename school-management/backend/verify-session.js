const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verify() {
  const sessions = await prisma.session.findMany();
  console.log('SESSIONS:');
  sessions.forEach(s => {
    console.log('  ' + s.name + ' - Active: ' + s.isActive);
  });

  const activeSession = await prisma.session.findFirst({ where: { isActive: true } });
  if (activeSession) {
    const terms = await prisma.term.findMany({ where: { sessionId: activeSession.id } });
    console.log('\nTERMS for ' + activeSession.name + ':');
    terms.forEach(t => {
      console.log('  ' + t.name + ' - Active: ' + t.isActive);
    });
  }
  
  await prisma.$disconnect();
}

verify();