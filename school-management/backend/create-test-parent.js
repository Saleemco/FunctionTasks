const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createTestParent() {
  console.log('Creating test parent...');
  
  // Check if parent already exists
  const existingUser = await prisma.user.findUnique({
    where: { email: 'testparent@school.com' }
  });
  
  if (!existingUser) {
    // Create user
    const user = await prisma.user.create({
      data: {
        email: 'testparent@school.com',
        password: 'parent123',
        name: 'Test Parent',
        role: 'PARENT'
      }
    });
    
    console.log('User created: ' + user.email);
    
    // Create parent profile
    const parent = await prisma.parent.create({
      data: {
        userId: user.id
      }
    });
    
    console.log('Parent profile created');
  } else {
    console.log('Parent already exists');
  }
  
  // Verify
  const parents = await prisma.parent.findMany({
    include: { user: true }
  });
  
  console.log('-----------------------');
  console.log('Total parents: ' + parents.length);
  parents.forEach(p => {
    console.log('  - ' + p.user?.name + ' (' + p.user?.email + ')');
  });
  
  await prisma.$disconnect();
}

createTestParent();