import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getSessionUser } from "@/lib/auth/session";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;

    // Verify ownership
    const resume = await prisma.resume.findUnique({
      where: { id, userId: user.id },
    });

    if (!resume) {
      return NextResponse.json({ error: "Resume not found" }, { status: 404 });
    }

    // Transaction to safely toggle default status
    // 1. Set all other resumes for this user to false
    // 2. Set this one to true
    await prisma.$transaction([
      prisma.resume.updateMany({
        where: { userId: user.id },
        data: { isDefault: false },
      }),
      prisma.resume.update({
        where: { id },
        data: { isDefault: true },
      }),
    ]);

    return NextResponse.json({ message: "Default resume updated successfully" });
  } catch (error) {
    console.error("Failed to update default resume:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
