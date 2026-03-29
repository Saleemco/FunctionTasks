const fetch = require('node-fetch');

async function testLogin() {
  const users = [
    { email: 'principal@school.com', password: 'principal123', role: 'PRINCIPAL' },
    { email: 'admin@school.com', password: 'admin123', role: 'ADMIN' },
    { email: 'bursar@school.com', password: 'bursar123', role: 'BURSAR' },
    { email: 'math.teacher@school.com', password: 'teacher123', role: 'TEACHER' },
    { email: 'parent@example.com', password: 'parent123', role: 'PARENT' },
    { email: 'student@example.com', password: 'student123', role: 'STUDENT' }
  ];

  for (const user of users) {
    try {
      const response = await fetch('http://localhost:3001/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email,
          password: user.password
        })
      });
      
      const data = await response.json();
      if (response.ok) {
        console.log(?  login successful:, data.user.email);
      } else {
        console.log(?  login failed:, data.error);
      }
    } catch (error) {
      console.error(?  error:, error.message);
    }
  }
}

testLogin();
