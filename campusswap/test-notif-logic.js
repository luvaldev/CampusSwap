const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
  try {
    const courseId = "CBM-1000";
    const userId = "cmqath85m0000101n25t9lksq"; // The sender
    
    const courseData = await prisma.course.findUnique({
      where: { id: courseId },
      include: { enrolledUsers: { select: { id: true } } }
    });

    if (courseData && courseData.enrolledUsers.length > 0) {
      const enrolledUserIds = courseData.enrolledUsers
        .filter(u => u.id !== userId)
        .map(u => u.id);

      if (enrolledUserIds.length > 0) {
        const notificationTitle = `Hay mensajes nuevos en ${courseData.name}`;
        
        const existingNotifs = await prisma.notification.findMany({
          where: {
            userId: { in: enrolledUserIds },
            type: 'COURSE_CHAT',
            title: notificationTitle,
            isRead: false
          },
          select: { userId: true }
        });
        
        const usersWithExistingNotif = new Set(existingNotifs.map(n => n.userId));
        const usersToNotify = enrolledUserIds.filter(id => !usersWithExistingNotif.has(id));

        if (usersToNotify.length > 0) {
          const res = await prisma.notification.createMany({
            data: usersToNotify.map(id => ({
              type: 'COURSE_CHAT',
              title: notificationTitle,
              message: 'Tus compañeros están conversando en el foro del curso.',
              userId: id
            }))
          });
          console.log("Success:", res);
        } else {
          console.log("No users to notify (already notified).");
        }
      } else {
        console.log("No other enrolled users.");
      }
    } else {
      console.log("Course not found or no enrolled users.");
    }
  } catch (err) {
    console.error("ERROR:", err);
  } finally {
    await prisma.$disconnect();
  }
}
test();
