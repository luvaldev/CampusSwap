const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function test() {
  const notifs = await prisma.notification.findMany({
    orderBy: { createdAt: 'desc' },
    take: 5
  });
  console.log(JSON.stringify(notifs, null, 2));
  await prisma.$disconnect();
}
test();
