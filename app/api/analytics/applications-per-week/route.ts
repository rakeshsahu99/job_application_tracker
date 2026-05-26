import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { getApplicationsPerWeek, getApplicationTimeline } from "@/lib/analytics/timeline";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || !user.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = req.nextUrl;
    const filter = searchParams.get("filter") || "all";
    
    // Determine whether to return daily or weekly data based on filter
    let data;
    if (filter === "7days" || filter === "30days") {
      const days = filter === "7days" ? 7 : 30;
      data = await getApplicationTimeline(user.id, days);
    } else {
      // For 'all' or default, use weekly view for the last 12 weeks
      data = await getApplicationsPerWeek(user.id, 12);
    }

    return NextResponse.json({ timeline: data });
  } catch (error) {
    console.error("Analytics Timeline error:", error);
    return NextResponse.json(
      { message: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
