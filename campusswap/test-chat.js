const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
  try {
    const courseId = "1";
    const user = await prisma.user.findFirst();
    console.log("User:", user.id);
    const message = await prisma.chatMessage.create({
      data: {
        content: "Test message",
        isMasked: false,
        userId: user.id,
        courseId: courseId,
      }
    });
    console.log("Message created:", message);
    
    const courseData = await prisma.course.findUnique({
      where: { id: courseId },
      include: { enrolledUsers: { select: { id: true } } }
    });
    console.log("CourseData:", courseData ? "Found" : "Not Found");
  } catch (err) {
    console.error(err);
  } finally {
    await prisma.$disconnect();
  }
}
test();
