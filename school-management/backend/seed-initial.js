const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seedInitial() {
  console.log('🌱 Starting initial database seeding...\n');

  try {
    // 1. Create Sessions
    console.log('📅 Creating sessions...');
    const currentSession = await prisma.session.create({
      data: {
        name: '2024-2025',
        startDate: new Date('2024-09-01'),
        endDate: new Date('2025-07-31'),
        isActive: true,
        isArchived: false
      }
    });
    console.log(`  ✅ Created session: ${currentSession.name}`);

    const nextSession = await prisma.session.create({
      data: {
        name: '2025-2026',
        startDate: new Date('2025-09-01'),
        endDate: new Date('2026-07-31'),
        isActive: false,
        isArchived: false
      }
    });
    console.log(`  ✅ Created session: ${nextSession.name}`);

    // 2. Create Terms for current session
    console.log('\n📖 Creating terms...');
    const terms = [
      { name: 'First Term', startDate: '2024-09-01', endDate: '2024-12-15', isActive: true },
      { name: 'Second Term', startDate: '2025-01-10', endDate: '2025-04-05', isActive: false },
      { name: 'Third Term', startDate: '2025-04-20', endDate: '2025-07-20', isActive: false }
    ];

    for (const termData of terms) {
      const term = await prisma.term.create({
        data: {
          name: termData.name,
          sessionId: currentSession.id,
          startDate: new Date(termData.startDate),
          endDate: new Date(termData.endDate),
          isActive: termData.isActive
        }
      });
      console.log(`  ✅ Created term: ${term.name} (${termData.startDate} - ${termData.endDate})`);
    }

    // 3. Create Classes
    console.log('\n🏫 Creating classes...');
    const classes = [
      { name: 'JSS 1', grade: 7 },
      { name: 'JSS 2', grade: 8 },
      { name: 'JSS 3', grade: 9 },
      { name: 'SSS 1', grade: 10 },
      { name: 'SSS 2', grade: 11 },
      { name: 'SSS 3', grade: 12 }
    ];

    for (const classData of classes) {
      const cls = await prisma.class.create({
        data: classData
      });
      console.log(`  ✅ Created class: ${cls.name} (Grade ${cls.grade})`);
    }

    // 4. Create Users
    console.log('\n👥 Creating users...');
    const users = [
      { email: 'principal@school.com', password: 'principal123', name: 'School Principal', role: 'PRINCIPAL' },
      { email: 'admin@school.com', password: 'admin123', name: 'Admin User', role: 'ADMIN' },
      { email: 'bursar@school.com', password: 'bursar123', name: 'School Bursar', role: 'BURSAR' },
      { email: 'teacher@school.com', password: 'teacher123', name: 'John Teacher', role: 'TEACHER' },
      { email: 'parent@example.com', password: 'parent123', name: 'Parent User', role: 'PARENT' },
      { email: 'student@example.com', password: 'student123', name: 'Student User', role: 'STUDENT' }
    ];

    for (const userData of users) {
      const user = await prisma.user.create({
        data: userData
      });
      console.log(`  ✅ Created ${user.role}: ${user.email}`);
    }

    // 5. Create Teacher Profile
    console.log('\n👨‍🏫 Creating teacher profile...');
    const teacherUser = await prisma.user.findUnique({
      where: { email: 'teacher@school.com' }
    });
    const teacher = await prisma.teacher.create({
      data: {
        userId: teacherUser.id
      }
    });
    console.log(`  ✅ Created teacher profile`);

    // 6. Create Parent Profile
    console.log('\n👪 Creating parent profile...');
    const parentUser = await prisma.user.findUnique({
      where: { email: 'parent@example.com' }
    });
    const parent = await prisma.parent.create({
      data: {
        userId: parentUser.id
      }
    });
    console.log(`  ✅ Created parent profile`);

    // 7. Create Student Profile
    console.log('\n🎓 Creating student profile...');
    const studentUser = await prisma.user.findUnique({
      where: { email: 'student@example.com' }
    });
    const jss1 = await prisma.class.findFirst({
      where: { name: 'JSS 1' }
    });
    const student = await prisma.student.create({
      data: {
        userId: studentUser.id,
        classId: jss1.id,
        admissionNo: 'STU240001',
        parentId: parent.id,
        gender: 'Male',
        status: 'ACTIVE'
      }
    });
    console.log(`  ✅ Created student: ${studentUser.name} (Admission: ${student.admissionNo})`);

    console.log('\n🎉 Initial database seeding completed successfully!');
    console.log('\n📋 Summary:');
    console.log(`  - Sessions: 2`);
    console.log(`  - Terms: 3`);
    console.log(`  - Classes: 6`);
    console.log(`  - Users: 6`);
    console.log(`  - Teacher: 1`);
    console.log(`  - Parent: 1`);
    console.log(`  - Student: 1`);

  } catch (error) {
    console.error('❌ Error during seeding:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedInitial();