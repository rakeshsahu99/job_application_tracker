import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { addAutomationJob } from "@/lib/queue/queue";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { applicationId, jobUrl } = await req.json();

    if (!applicationId || !jobUrl) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Ensure the application belongs to the user
    const application = await prisma.jobApplication.findFirst({
      where: {
        id: applicationId,
        userId: session.user.id,
      },
    });

    if (!application) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    // Create an automation task record
    const task = await prisma.automationTask.create({
      data: {
        platform: jobUrl.includes("greenhouse.io") ? "greenhouse" : jobUrl.includes("jobs.lever.co") ? "lever" : "unknown",
        status: "QUEUED",
        applicationId: applicationId,
      },
    });

    // Dispatch job to Redis queue using BullMQ
    await addAutomationJob("auto-apply", {
      taskId: task.id,
      applicationId,
      jobUrl,
    });

    return NextResponse.json({
      message: "Automation task successfully queued",
      taskId: task.id,
    });
  } catch (error: any) {
    console.error("Failed to queue automation task:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
