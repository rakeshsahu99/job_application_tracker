import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/db/prisma";
import { generateResumeImprovements } from "@/lib/ai/recommendations/improvements";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { resumeId } = await req.json();
    if (!resumeId) return NextResponse.json({ error: "resumeId required" }, { status: 400 });

    const resume = await prisma.resume.findUnique({
      where: { id: resumeId, userId: user.id }
    });

    if (!resume || !resume.parsedText) {
      return NextResponse.json({ error: "Resume text not available" }, { status: 400 });
    }

    const improvements = await generateResumeImprovements(resume.parsedText);
    return NextResponse.json(improvements);
  } catch (error) {
    console.error("AI Recommendations Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
