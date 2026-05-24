import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db/prisma"
import { supabaseAdmin } from "@/lib/supabase"

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

    // 1. Fetch resume from DB to ensure ownership and get fileUrl
    const resume = await prisma.resume.findUnique({
      where: { id },
    })

    if (!resume) {
      return NextResponse.json({ error: "Resume not found" }, { status: 404 })
    }

    if (resume.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // 2. Extract path from fileUrl to delete from Supabase Storage
    // Example fileUrl: https://[projectId].supabase.co/storage/v1/object/public/resumes/[userId]/[fileName]
    // The path needed for remove() is "[userId]/[fileName]"
    const urlParts = resume.fileUrl.split("/resumes/")
    if (urlParts.length > 1) {
      const storagePath = urlParts[1]
      
      const { error: storageError } = await supabaseAdmin.storage
        .from("resumes")
        .remove([storagePath])

      if (storageError) {
        console.error("Failed to delete from Supabase Storage:", storageError)
        // We log the error but still proceed to delete the DB record.
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
