import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { getOverviewStats, getTopCompanies, getResumePerformance } from "@/lib/analytics/stats";
import { getApplicationTimeline } from "@/lib/analytics/timeline";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || !user.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = req.nextUrl;
    const filter = searchParams.get("filter") || "30days";
    let days = 30;
    
    if (filter === "7days") days = 7;
    else if (filter === "all") days = 365 * 10; // 10 years effectively all
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const [overview, timeline, topCompanies, resumePerformance] = await Promise.all([
      getOverviewStats(user.id, filter !== "all" ? startDate : undefined),
      getApplicationTimeline(user.id, days > 365 ? 30 : days), // Limit timeline to 30 days if "all" to avoid huge charts, or could group by month
      getTopCompanies(user.id),
      getResumePerformance(user.id)
    ]);

    return NextResponse.json({
      overview,
      timeline,
      topCompanies,
      resumePerformance
    });
  } catch (error) {
    console.error("Analytics GET error:", error);
    return NextResponse.json(
      { message: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
