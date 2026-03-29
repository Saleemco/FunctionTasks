const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  try {
    // Find the parent user
    const parentUser = await prisma.user.findUnique({
      where: { email: 'parent@school.com' }
    });
    
    console.log('Parent user:', parentUser ? 'Found' : 'Not found');
    
    if (parentUser) {
      console.log('Parent user ID:', parentUser.id);
      
      // Find parent profile
      const parent = await prisma.parent.findUnique({
        where: { userId: parentUser.id },
        include: { 
          children: {
            include: {
              user: true,
              fees: true
            }
          }
        }
      });
      
      console.log('Parent profile:', parent ? 'Found' : 'Not found');
      
      if (parent) {
        console.log('Parent profile ID:', parent.id);
        console.log('Children count:', parent.children.length);
        
        if (parent.children.length > 0) {
          console.log('Children details:');
          parent.children.forEach((child, index) => {
            console.log('Child ' + (index + 1) + ':');
            console.log('  Name: ' + child.user.firstName + ' ' + child.user.lastName);
            console.log('  Admission: ' + child.admissionNo);
            console.log('  Fees count: ' + child.fees.length);
            if (child.fees.length > 0) {
              const totalFees = child.fees.reduce((sum, f) => sum + f.totalAmount, 0);
              console.log('  Total fees amount: ₦' + totalFees);
            }
          });
        } else {
          console.log('No children linked to this parent');
        }
      } else {
        console.log('Parent profile not found for this user');
      }
    } else {
      console.log('Parent user not found with email: parent@school.com');
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

check();