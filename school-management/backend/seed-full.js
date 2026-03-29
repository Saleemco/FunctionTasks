const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seedFull() {
  console.log('🌱 Starting full database seeding...\n');

  try {
    // 1. CREATE CLASSES
    console.log('📚 Creating classes...');
    const class5A = await prisma.class.create({
      data: {
        name: 'Grade 5A',
        grade: 5
      }
    });
    console.log('  ✅ Created class:', class5A.name);

    const class6B = await prisma.class.create({
      data: {
        name: 'Grade 6B',
        grade: 6
      }
    });
    console.log('  ✅ Created class:', class6B.name);

    const class7C = await prisma.class.create({
      data: {
        name: 'Grade 7C',
        grade: 7
      }
    });
    console.log('  ✅ Created class:', class7C.name);

    // 2. FIND USERS BY EMAIL
    console.log('\n👥 Finding users...');
    const principal = await prisma.user.findUnique({ where: { email: 'principal@school.com' } });
    const admin = await prisma.user.findUnique({ where: { email: 'admin@school.com' } });
    const bursar = await prisma.user.findUnique({ where: { email: 'bursar@school.com' } });
    const teacher = await prisma.user.findUnique({ where: { email: 'math.teacher@school.com' } });
    const parent = await prisma.user.findUnique({ where: { email: 'parent@example.com' } });
    const student = await prisma.user.findUnique({ where: { email: 'student@example.com' } });

    console.log('  ✅ Found all users');

    // 3. CREATE TEACHER PROFILE
    console.log('\n👨‍🏫 Creating teacher profile...');
    const teacherProfile = await prisma.teacher.create({
      data: {
        userId: teacher.id
      }
    });
    console.log('  ✅ Created teacher profile for:', teacher.email);

    // 4. CREATE SUBJECTS
    console.log('\n📖 Creating subjects...');
    const math = await prisma.subject.create({
      data: {
        name: 'Mathematics',
        classId: class5A.id,
        teacherId: teacherProfile.id
      }
    });
    console.log('  ✅ Created subject:', math.name);

    const science = await prisma.subject.create({
      data: {
        name: 'Science',
        classId: class5A.id,
        teacherId: teacherProfile.id
      }
    });
    console.log('  ✅ Created subject:', science.name);

    const english = await prisma.subject.create({
      data: {
        name: 'English',
        classId: class6B.id,
        teacherId: teacherProfile.id
      }
    });
    console.log('  ✅ Created subject:', english.name);

    // 5. CREATE PARENT PROFILE
    console.log('\n👪 Creating parent profile...');
    const parentProfile = await prisma.parent.create({
      data: {
        userId: parent.id
      }
    });
    console.log('  ✅ Created parent profile for:', parent.email);

    // 6. CREATE STUDENT PROFILE
    console.log('\n🎓 Creating student profile...');
    const studentProfile = await prisma.student.create({
      data: {
        userId: student.id,
        classId: class5A.id,
        parentId: parentProfile.id
      }
    });
    console.log('  ✅ Created student profile for:', student.email);

    // 7. CREATE ATTENDANCE RECORDS
    console.log('\n📅 Creating attendance records...');
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const attendance1 = await prisma.attendance.create({
      data: {
        date: today,
        status: 'PRESENT',
        studentId: studentProfile.id,
        classId: class5A.id
      }
    });
    console.log('  ✅ Created attendance for today');

    const attendance2 = await prisma.attendance.create({
      data: {
        date: yesterday,
        status: 'PRESENT',
        studentId: studentProfile.id,
        classId: class5A.id
      }
    });
    console.log('  ✅ Created attendance for yesterday');

    // 8. CREATE GRADES
    console.log('\n📊 Creating grades...');
    const grade1 = await prisma.grade.create({
      data: {
        score: 85.5,
        type: 'EXAM',
        studentId: studentProfile.id,
        subjectId: math.id
      }
    });
    console.log('  ✅ Created math grade: 85.5');

    const grade2 = await prisma.grade.create({
      data: {
        score: 92.0,
        type: 'EXAM',
        studentId: studentProfile.id,
        subjectId: science.id
      }
    });
    console.log('  ✅ Created science grade: 92.0');

    const grade3 = await prisma.grade.create({
      data: {
        score: 78.5,
        type: 'HOMEWORK',
        studentId: studentProfile.id,
        subjectId: math.id
      }
    });
    console.log('  ✅ Created math homework grade: 78.5');

    // 9. SUMMARY
    console.log('\n📋 ===== SEEDING SUMMARY =====');
    console.log(`Classes created: 3 (${class5A.name}, ${class6B.name}, ${class7C.name})`);
    console.log(`Subjects created: 3 (${math.name}, ${science.name}, ${english.name})`);
    console.log(`Teacher profile: ✅ for ${teacher.email}`);
    console.log(`Parent profile: ✅ for ${parent.email}`);
    console.log(`Student profile: ✅ for ${student.email}`);
    console.log(`Attendance records: 2`);
    console.log(`Grades created: 3`);
    console.log('\n🎉 Full database seeding completed successfully!');

  } catch (error) {
    console.error('❌ Error during seeding:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedFull();