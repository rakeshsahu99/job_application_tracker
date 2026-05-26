import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { getOverviewStats, getResumePerformance } from "@/lib/analytics/stats";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || !user.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = req.nextUrl;
    const filter = searchParams.get("filter") || "all";
    let days = undefined;
    
    if (filter === "7days") days = 7;
    else if (filter === "30days") days = 30;
    
    let startDate = undefined;
    if (days) {
      startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
    }

    const overview = await getOverviewStats(user.id, startDate);
    const resumePerformance = await getResumePerformance(user.id);

    return NextResponse.json({
      interviewRate: overview.interviewRate,
      offerRate: overview.offerRate,
      rejectionRate: overview.rejectionRate,
      responseRate: overview.responseRate,
      bestPerformingResume: resumePerformance[0] || null
    });
  } catch (error) {
    console.error("Analytics Interview Rate error:", error);
    return NextResponse.json(
      { message: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
