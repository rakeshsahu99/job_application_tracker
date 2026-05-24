import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/session"
import { prisma } from "@/lib/db/prisma"
import { z } from "zod"

const applicationSchema = z.object({
  company: z.string().min(1, "Company name is required"),
  role: z.string().min(1, "Role is required"),
  location: z.string().optional().nullable(),
  jobUrl: z.string().url("Invalid URL").or(z.literal("")).optional().nullable(),
  salary: z.string().optional().nullable(),
  status: z.enum(["SAVED", "APPLIED", "INTERVIEW", "REJECTED", "OFFER"]).default("SAVED"),
  notes: z.string().optional().nullable(),
})

// GET /api/applications - Fetch all user applications (supports search and status filter)
export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser()

    if (!user || !user.id) {
      return NextResponse.json(
        { message: "Unauthorized: You must be logged in" },
        { status: 401 }
      )
    }

    const { searchParams } = req.nextUrl
    const query = searchParams.get("query") || ""
    const status = searchParams.get("status")

    // Build Prisma query filters
    const whereClause: any = {
      userId: user.id,
    }

    if (query) {
      whereClause.OR = [
        { company: { contains: query, mode: "insensitive" } },
        { role: { contains: query, mode: "insensitive" } },
      ]
    }

    if (status && ["SAVED", "APPLIED", "INTERVIEW", "REJECTED", "OFFER"].includes(status)) {
      whereClause.status = status
    }

    const applications = await prisma.jobApplication.findMany({
      where: whereClause,
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json(applications)
  } catch (error) {
    console.error("GET applications error:", error)
    return NextResponse.json(
      { message: "An unexpected error occurred" },
      { status: 500 }
    )
  }
}

// POST /api/applications - Create a new job application
export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser()

    if (!user || !user.id) {
      return NextResponse.json(
        { message: "Unauthorized: You must be logged in" },
        { status: 401 }
      )
    }

    const body = await req.json()
    const parsed = applicationSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { message: parsed.error.issues[0].message },
        { status: 400 }
      )
    }

    const { company, role, location, jobUrl, salary, status, notes } = parsed.data

    const application = await prisma.jobApplication.create({
      data: {
        company,
        role,
        location: location || null,
        jobUrl: jobUrl || null,
        salary: salary || null,
        status: status || "SAVED",
        notes: notes || null,
        userId: user.id,
      },
    })

    return NextResponse.json(application, { status: 201 })
  } catch (error) {
    console.error("POST applications error:", error)
    return NextResponse.json(
      { message: "An unexpected error occurred" },
      { status: 500 }
    )
  }
}
