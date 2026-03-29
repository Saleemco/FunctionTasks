const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verifyData() {
  console.log('=' .repeat(50));
  console.log('📊 DATABASE VERIFICATION');
  console.log('=' .repeat(50));

  // Check Users
  const users = await prisma.user.findMany();
  console.log('\n👥 USERS:');
  console.log('-'.repeat(30));
  users.forEach(u => {
    console.log(`  ${u.role}: ${u.email}`);
  });

  // Check Sessions
  const sessions = await prisma.session.findMany({
    include: { terms: true }
  });
  console.log('\n📅 SESSIONS:');
  console.log('-'.repeat(30));
  sessions.forEach(s => {
    console.log(`  ${s.name} (${s.isActive ? 'ACTIVE' : 'Inactive'}):`);
    s.terms.forEach(t => {
      console.log(`    - ${t.name} (${t.isActive ? 'Active' : 'Inactive'})`);
    });
  });

  // Check Classes
  const classes = await prisma.class.findMany();
  console.log('\n🏫 CLASSES:');
  console.log('-'.repeat(30));
  classes.forEach(c => {
    console.log(`  ${c.name} (Grade ${c.grade})`);
  });

  // Check Students
  const students = await prisma.student.findMany({
    include: {
      user: true,
      class: true
    }
  });
  console.log('\n🎓 STUDENTS:');
  console.log('-'.repeat(30));
  students.forEach(s => {
    console.log(`  ${s.user?.name} (Admission: ${s.admissionNo}) - Class: ${s.class?.name}`);
  });

  // Check Teachers
  const teachers = await prisma.teacher.findMany({
    include: { user: true }
  });
  console.log('\n👨‍🏫 TEACHERS:');
  console.log('-'.repeat(30));
  teachers.forEach(t => {
    console.log(`  ${t.user?.name}`);
  });

  // Check Parents
  const parents = await prisma.parent.findMany({
    include: { user: true }
  });
  console.log('\n👪 PARENTS:');
  console.log('-'.repeat(30));
  parents.forEach(p => {
    console.log(`  ${p.user?.name}`);
  });

  console.log('\n' + '='.repeat(50));
  console.log('✅ Verification complete!');
  console.log('='.repeat(50));
}

verifyData()
  .catch(console.error)
  .finally(() => prisma.$disconnect());