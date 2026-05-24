import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/session"
import { prisma } from "@/lib/db/prisma"

export async function GET() {
  try {
    const user = await getCurrentUser()

    if (!user || !user.id) {
      return NextResponse.json(
        { message: "Unauthorized: You must be logged in to access this resource" },
        { status: 401 }
      )
    }

    // Fetch user details from the database (excluding password for security)
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
    })

    if (!dbUser) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(dbUser)
  } catch (error) {
    console.error("Failed to fetch user profile:", error)
    return NextResponse.json(
      { message: "An unexpected error occurred" },
      { status: 500 }
    )
  }
}
