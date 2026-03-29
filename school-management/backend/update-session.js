const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function updateActiveSession() {
  try {
    // Deactivate all sessions first
    await prisma.session.updateMany({
      where: { isActive: true },
      data: { isActive: false }
    });
    console.log('Deactivated all sessions');

    // Activate 2025-2026 session
    const activeSession = await prisma.session.update({
      where: { name: '2025-2026' },
      data: { isActive: true }
    });
    console.log('Activated session:', activeSession.name);

    // Check existing terms
    const existingTerms = await prisma.term.findMany({
      where: { sessionId: activeSession.id }
    });

    if (existingTerms.length === 0) {
      // Create terms for 2025-2026
      const terms = [
        { name: 'First Term', startDate: '2025-09-01', endDate: '2025-12-15', isActive: true },
        { name: 'Second Term', startDate: '2026-01-10', endDate: '2026-04-05', isActive: false },
        { name: 'Third Term', startDate: '2026-04-20', endDate: '2026-07-20', isActive: false }
      ];

      for (const termData of terms) {
        await prisma.term.create({
          data: {
            name: termData.name,
            sessionId: activeSession.id,
            startDate: new Date(termData.startDate),
            endDate: new Date(termData.endDate),
            isActive: termData.isActive
          }
        });
        console.log('  Created term:', termData.name);
      }
    } else {
      console.log('Terms already exist for 2025-2026');
      // Update first term to be active
      await prisma.term.updateMany({
        where: { sessionId: activeSession.id },
        data: { isActive: false }
      });
      await prisma.term.update({
        where: { id: existingTerms[0].id },
        data: { isActive: true }
      });
      console.log('  First term set as active');
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateActiveSession();