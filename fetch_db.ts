import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('--- USERS ---')
  const users = await prisma.user.findMany()
  console.table(users.map(u => ({ id: u.id, name: u.name, email: u.email, role: u.role })))

  console.log('\n--- INSTITUTIONS ---')
  const institutions = await prisma.institution.findMany()
  console.table(institutions.map(i => ({ id: i.id, name: i.name, blockchainId: i.blockchainId })))

  console.log('\n--- CERTIFICATES ---')
  const certificates = await prisma.certificate.findMany({
    include: {
      institution: { select: { name: true } }
    }
  })
  console.table(certificates.map(c => ({
    id: c.id,
    code: c.certCode,
    student: c.studentName || 'N/A',
    degree: c.degree || 'N/A',
    inst: c.institution?.name || 'N/A',
    hash: c.fileHash.substring(0, 10) + '...'
  })))
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
