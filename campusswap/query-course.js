const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function test() {
  const course = await prisma.course.findUnique({
    where: { id: "CBM-1000" },
    include: { enrolledUsers: { select: { id: true, email: true } } }
  });
  console.log(JSON.stringify(course?.enrolledUsers, null, 2));
  await prisma.$disconnect();
}
test();
