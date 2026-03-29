const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkDatabase() {
  console.log('========================================');
  console.log('📊 DATABASE CHECK');
  console.log('========================================\n');
  
  // Check all users
  const users = await prisma.user.findMany();
  console.log('👥 USERS:');
  console.log('----------------------------------------');
  if (users.length === 0) {
    console.log('No users found in database!');
  } else {
    console.log('Total users: ' + users.length);
    users.forEach(u => {
      console.log('  ID: ' + u.id);
      console.log('  Email: ' + u.email);
      console.log('  Name: ' + u.name);
      console.log('  Role: ' + u.role);
      console.log('  ---');
    });
  }
  
  console.log('\n👨‍🏫 TEACHER PROFILES:');
  console.log('----------------------------------------');
  const teachers = await prisma.teacher.findMany({
    include: { user: true }
  });
  
  if (teachers.length === 0) {
    console.log('No teacher profiles found!');
  } else {
    console.log('Total teacher profiles: ' + teachers.length);
    teachers.forEach(t => {
      console.log('  Teacher ID: ' + t.id);
      console.log('  User ID: ' + t.userId);
      console.log('  Name: ' + (t.user?.name || 'Unknown'));
      console.log('  Email: ' + (t.user?.email || 'Unknown'));
      console.log('  ---');
    });
  }
  
  console.log('\n📚 CLASSES:');
  console.log('----------------------------------------');
  const classes = await prisma.class.findMany();
  if (classes.length === 0) {
    console.log('No classes found!');
  } else {
    console.log('Total classes: ' + classes.length);
    classes.forEach(c => {
      console.log('  ' + c.name + ' (Grade: ' + c.grade + ')');
    });
  }
  
  console.log('\n📖 SUBJECTS:');
  console.log('----------------------------------------');
  const subjects = await prisma.subject.findMany();
  if (subjects.length === 0) {
    console.log('No subjects found!');
  } else {
    console.log('Total subjects: ' + subjects.length);
    subjects.forEach(s => {
      console.log('  ' + s.name);
    });
  }
  
  console.log('\n========================================');
  await prisma.$disconnect();
}

checkDatabase().catch(console.error);