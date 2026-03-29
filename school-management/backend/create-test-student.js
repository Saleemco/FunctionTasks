const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createTestStudent() {
  try {
    // Create user for student
    const user = await prisma.user.create({
      data: {
        email: 'test.student' + Date.now() + '@school.com',
        password: 'password123',
        name: 'Test Student',
        role: 'STUDENT'
      }
    });
    console.log('User created:', user.email);
    
    // Get a class
    const class_ = await prisma.class.findFirst();
    if (!class_) {
      console.log('No class found!');
      return;
    }
    console.log('Using class:', class_.name);
    
    // Create student without parent
    const student = await prisma.student.create({
      data: {
        userId: user.id,
        classId: class_.id,
        admissionNo: 'TEST' + Date.now().toString().slice(-6),
        parentId: null
      },
      include: { user: true }
    });
    
    console.log('Student created successfully!');
    console.log('Student ID:', student.id);
    console.log('Student Name:', student.user?.name);
    console.log('Admission No:', student.admissionNo);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestStudent();