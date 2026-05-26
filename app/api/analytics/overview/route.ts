import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { getOverviewStats, getMostActiveMonth, getTopLocations } from "@/lib/analytics/stats";

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

    const [overview, mostActiveMonth, topLocations] = await Promise.all([
      getOverviewStats(user.id, startDate),
      getMostActiveMonth(user.id),
      getTopLocations(user.id)
    ]);

    return NextResponse.json({
      ...overview,
      mostActiveMonth,
      topLocations
    });
  } catch (error) {
    console.error("Analytics Overview error:", error);
    return NextResponse.json(
      { message: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
