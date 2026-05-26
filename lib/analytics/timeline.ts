import { prisma } from "@/lib/db/prisma";
import { format, startOfWeek, endOfWeek, parseISO, subDays, subWeeks } from "date-fns";

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

  // Group by day for the last X days
  const timelineMap: Record<string, number> = {};
  
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

  return Object.entries(timelineMap)
    .map(([date, count]) => ({ date, applications: count }))
    .reverse();
}

export async function getApplicationsPerWeek(userId: string, weeks = 12) {
  const startDate = subWeeks(new Date(), weeks);

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

  const timelineMap: Record<string, number> = {};
  
  for (let i = 0; i <= weeks; i++) {
    const date = subWeeks(new Date(), i);
    const weekStart = startOfWeek(date);
    const formattedDate = format(weekStart, "MMM dd");
    timelineMap[formattedDate] = 0;
  }

  applications.forEach(app => {
    const weekStart = startOfWeek(new Date(app.createdAt));
    const formattedDate = format(weekStart, "MMM dd");
    if (timelineMap[formattedDate] !== undefined) {
      timelineMap[formattedDate] += 1;
    }
  });

  return Object.entries(timelineMap)
    .map(([week, count]) => ({ week, applications: count }))
    .reverse();
}
