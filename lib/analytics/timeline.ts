import { prisma } from "@/lib/db/prisma";
import { format, startOfWeek, startOfMonth, parseISO, subDays } from "date-fns";

export async function getApplicationTimeline(userId: string, days = 30) {
  const startDate = subDays(new Date(), days);

  const applications = await prisma.jobApplication.findMany({
    where: {
      userId,
      createdAt: {
        gte: startDate,
      },
    },
    select: {
      createdAt: true,
    },
    orderBy: {
      createdAt: 'asc',
    },
  });

  // Group by day for the last 30 days
  const timelineMap: Record<string, number> = {};
  
  // Initialize all days with 0 to ensure we don't have gaps in the chart
  for (let i = 0; i <= days; i++) {
    const date = subDays(new Date(), i);
    const formattedDate = format(date, "MMM dd");
    timelineMap[formattedDate] = 0;
  }

  applications.forEach(app => {
    const formattedDate = format(new Date(app.createdAt), "MMM dd");
    if (timelineMap[formattedDate] !== undefined) {
      timelineMap[formattedDate] += 1;
    }
  });

  // Convert map to array and sort by date chronologically
  return Object.entries(timelineMap)
    .map(([date, count]) => ({ date, applications: count }))
    .reverse(); // Reverse because we initialized by iterating backwards
}
