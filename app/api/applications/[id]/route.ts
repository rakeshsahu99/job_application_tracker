import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/session"
import { prisma } from "@/lib/db/prisma"
import { z } from "zod"

const patchSchema = z.object({
  company: z.string().min(1, "Company name is required").optional(),
  role: z.string().min(1, "Role is required").optional(),
  location: z.string().optional().nullable(),
  jobUrl: z.string().url("Invalid URL").or(z.literal("")).optional().nullable(),
  salary: z.string().optional().nullable(),
  status: z.enum(["SAVED", "APPLIED", "INTERVIEW", "REJECTED", "OFFER"]).optional(),
  notes: z.string().optional().nullable(),
})

// PATCH /api/applications/[id] - Update a job application
export async function PATCH(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()

    if (!user || !user.id) {
      return NextResponse.json(
        { message: "Unauthorized: You must be logged in" },
        { status: 401 }
      )
    }

    const { id } = await ctx.params

    // Verify ownership of the application
    const existing = await prisma.jobApplication.findUnique({
      where: { id },
    })

    if (!existing || existing.userId !== user.id) {
      return NextResponse.json(
        { message: "Application not found or unauthorized" },
        { status: 404 }
      )
    }

    const body = await req.json()
    const parsed = patchSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { message: parsed.error.issues[0].message },
        { status: 400 }
      )
    }

    const data = parsed.data

    const updated = await prisma.jobApplication.update({
      where: { id },
      data: {
        ...data,
        location: data.location === undefined ? existing.location : data.location,
        jobUrl: data.jobUrl === undefined ? existing.jobUrl : data.jobUrl,
        salary: data.salary === undefined ? existing.salary : data.salary,
        notes: data.notes === undefined ? existing.notes : data.notes,
      },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error("PATCH application error:", error)
    return NextResponse.json(
      { message: "An unexpected error occurred" },
      { status: 500 }
    )
  }
}

// DELETE /api/applications/[id] - Delete a job application
export async function DELETE(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()

    if (!user || !user.id) {
      return NextResponse.json(
        { message: "Unauthorized: You must be logged in" },
        { status: 401 }
      )
    }

    const { id } = await ctx.params

    // Verify ownership of the application
    const existing = await prisma.jobApplication.findUnique({
      where: { id },
    })

    if (!existing || existing.userId !== user.id) {
      return NextResponse.json(
        { message: "Application not found or unauthorized" },
        { status: 404 }
      )
    }

    // Delete the application
    await prisma.jobApplication.delete({
      where: { id },
    })

    return NextResponse.json({ message: "Application deleted successfully" })
  } catch (error) {
    console.error("DELETE application error:", error)
    return NextResponse.json(
      { message: "An unexpected error occurred" },
      { status: 500 }
    )
  }
}
