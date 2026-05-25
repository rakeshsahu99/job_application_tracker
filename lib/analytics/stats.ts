import { prisma } from "@/lib/db/prisma";
import { ApplicationStatus } from "@prisma/client";

export async function getOverviewStats(userId: string, startDate?: Date, endDate?: Date) {
  const dateFilter = {
    ...(startDate && { gte: startDate }),
    ...(endDate && { lte: endDate }),
  };

  const applications = await prisma.jobApplication.findMany({
    where: {
      userId,
      ...(Object.keys(dateFilter).length > 0 && { createdAt: dateFilter }),
    },
    select: {
      status: true,
      resumeId: true,
      company: true,
    },
  });

  const total = applications.length;

  const statusCounts = applications.reduce((acc, app) => {
    acc[app.status] = (acc[app.status] || 0) + 1;
    return acc;
  }, {} as Record<ApplicationStatus, number>);

  const interviews = statusCounts[ApplicationStatus.INTERVIEW] || 0;
  const offers = statusCounts[ApplicationStatus.OFFER] || 0;
  const rejections = statusCounts[ApplicationStatus.REJECTED] || 0;

  const interviewRate = total > 0 ? (interviews / total) * 100 : 0;
  const offerRate = total > 0 ? (offers / total) * 100 : 0;
  const rejectionRate = total > 0 ? (rejections / total) * 100 : 0;

  const activeApplications = total - offers - rejections;

  return {
    total,
    interviews,
    offers,
    rejections,
    interviewRate,
    offerRate,
    rejectionRate,
    activeApplications,
    statusDistribution: Object.entries(statusCounts).map(([status, count]) => ({
      name: status,
      value: count,
    })),
  };
}

export async function getTopCompanies(userId: string, limit = 5) {
  const companies = await prisma.jobApplication.groupBy({
    by: ['company'],
    where: { userId },
    _count: {
      company: true,
    },
    orderBy: {
      _count: {
        company: 'desc',
      },
    },
    take: limit,
  });

  return companies.map(c => ({
    name: c.company,
    applications: c._count.company,
  }));
}

export async function getResumePerformance(userId: string) {
  const applications = await prisma.jobApplication.findMany({
    where: { userId, resumeId: { not: null } },
    select: {
      resumeId: true,
      status: true,
      resume: {
        select: {
          title: true,
        },
      },
    },
  });

  const resumeStats: Record<string, { title: string; total: number; interviews: number }> = {};

  applications.forEach(app => {
    if (!app.resumeId || !app.resume) return;
    
    if (!resumeStats[app.resumeId]) {
      resumeStats[app.resumeId] = {
        title: app.resume.title,
        total: 0,
        interviews: 0,
      };
    }
    
    resumeStats[app.resumeId].total += 1;
    if (app.status === ApplicationStatus.INTERVIEW || app.status === ApplicationStatus.OFFER) {
      resumeStats[app.resumeId].interviews += 1;
    }
  });

  return Object.values(resumeStats).map(stat => ({
    title: stat.title,
    total: stat.total,
    interviews: stat.interviews,
    interviewRate: stat.total > 0 ? (stat.interviews / stat.total) * 100 : 0,
  })).sort((a, b) => b.interviewRate - a.interviewRate);
}
