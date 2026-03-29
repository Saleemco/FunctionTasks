import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  console.log('Seeding...')
  
  await prisma.user.create({
    data: {
      email: 'seed@test.com',
      password: 'password',
      name: 'Seed User',
      role: 'ADMIN'
    }
  })
  
  console.log('Seed complete')
}

main()
  .catch(console.error)
  .finally(() => prisma.())
