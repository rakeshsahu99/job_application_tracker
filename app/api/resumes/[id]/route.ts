import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db/prisma"
import { unlink } from "fs/promises"
import { join } from "path"

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    // 1. Fetch resume from DB to ensure ownership and get resumeUrl
    const resume = await prisma.resume.findUnique({
      where: { id },
    })

    if (!resume) {
      return NextResponse.json({ error: "Resume not found" }, { status: 404 })
    }

    if (resume.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // 2. Delete the local file
    if (resume.resumeUrl && resume.resumeUrl.startsWith('/uploads/')) {
      const fileName = resume.resumeUrl.replace('/uploads/', '')
      const filePath = join(process.cwd(), "public", "uploads", fileName)
      
      try {
        await unlink(filePath)
      } catch (fileError) {
        console.error("Failed to delete local file:", fileError)
        // Log the error but proceed to delete the DB record
      }
    }

    // 3. Delete from DB
    await prisma.resume.delete({
      where: { id },
    })

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error("Delete Resume Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
