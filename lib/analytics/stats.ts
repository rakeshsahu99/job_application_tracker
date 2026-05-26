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
  
  // Response rate: percentage of applications that received any status other than SAVED or APPLIED
  const responded = interviews + offers + rejections;
  const responseRate = total > 0 ? (responded / total) * 100 : 0;

  const activeApplications = total - offers - rejections;

  return {
    total,
    interviews,
    offers,
    rejections,
    interviewRate,
    offerRate,
    rejectionRate,
    responseRate,
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

export async function getTopLocations(userId: string, limit = 5) {
  const locations = await prisma.jobApplication.groupBy({
    by: ['location'],
    where: { 
      userId,
      location: { not: null }
    },
    _count: {
      location: true,
    },
    orderBy: {
      _count: {
        location: 'desc',
      },
    },
    take: limit,
  });

  return locations.map(l => ({
    name: l.location,
    applications: l._count.location,
  }));
}

export async function getMostActiveMonth(userId: string) {
  const applications = await prisma.jobApplication.findMany({
    where: { userId },
    select: { createdAt: true },
  });

  const monthCounts: Record<string, number> = {};
  
  applications.forEach(app => {
    const month = new Date(app.createdAt).toLocaleString('default', { month: 'long', year: 'numeric' });
    monthCounts[month] = (monthCounts[month] || 0) + 1;
  });

  let maxMonth = "N/A";
  let maxCount = 0;

  for (const [month, count] of Object.entries(monthCounts)) {
    if (count > maxCount) {
      maxCount = count;
      maxMonth = month;
    }
  }

  return { month: maxMonth, count: maxCount };
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
          version: true,
        },
      },
    },
  });

  const resumeStats: Record<string, { title: string; version: number; total: number; interviews: number }> = {};

  applications.forEach(app => {
    if (!app.resumeId || !app.resume) return;
    
    if (!resumeStats[app.resumeId]) {
      resumeStats[app.resumeId] = {
        title: app.resume.title,
        version: app.resume.version,
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
    version: stat.version,
    total: stat.total,
    interviews: stat.interviews,
    interviewRate: stat.total > 0 ? (stat.interviews / stat.total) * 100 : 0,
  })).sort((a, b) => b.interviewRate - a.interviewRate);
}
