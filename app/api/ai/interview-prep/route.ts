import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/db/prisma";
import { generateInterviewPrep } from "@/lib/ai/interview/questions";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { resumeId, jobDescription } = await req.json();
    if (!resumeId || !jobDescription) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const resume = await prisma.resume.findUnique({
      where: { id: resumeId, userId: user.id }
    });

    if (!resume || !resume.parsedText) {
      return NextResponse.json({ error: "Resume text not available" }, { status: 400 });
    }

    const prepGuide = await generateInterviewPrep(resume.parsedText, jobDescription);
    return NextResponse.json(prepGuide);
  } catch (error) {
    console.error("AI Interview Prep Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
