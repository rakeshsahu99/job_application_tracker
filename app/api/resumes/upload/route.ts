import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db/prisma"
import { supabaseAdmin } from "@/lib/supabase"
const pdfParse = require("pdf-parse")
import { extractSkillsFromText } from "@/lib/parsers/skillExtractor"

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await req.formData()
    const file = formData.get("file") as File | null
    const title = formData.get("title") as string | null

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }
    if (!title) {
      return NextResponse.json({ error: "No title provided" }, { status: 400 })
    }

    // Validate file type
    if (file.type !== "application/pdf") {
      return NextResponse.json({ error: "Only PDF files are allowed" }, { status: 400 })
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "File must be smaller than 5MB" }, { status: 400 })
    }

    // Create a unique file name
    const timestamp = Date.now()
    const fileExt = file.name.split('.').pop()
    const uniqueFileName = `${session.user.id}/${timestamp}-${Math.random().toString(36).substring(7)}.${fileExt}`

    // Ensure the resumes bucket exists (Optional, ideally created manually in dashboard once)
    // Supabase JS will fail gracefully if bucket exists, but it's better to assume it exists.

    // 1. Convert File to ArrayBuffer, then to Buffer for both Supabase and pdf-parse
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // 2. Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from("resumes")
      .upload(uniqueFileName, buffer, {
        contentType: file.type,
        upsert: false,
      })

    if (uploadError) {
      console.error("Supabase Upload Error:", uploadError)
      return NextResponse.json({ error: "Failed to upload file to storage" }, { status: 500 })
    }

    // Retrieve public URL
    const { data: publicUrlData } = supabaseAdmin.storage
      .from("resumes")
      .getPublicUrl(uniqueFileName)

    const fileUrl = publicUrlData.publicUrl

    // 3. Extract text using pdf-parse
    let extractedText = ""
    try {
      const pdfData = await pdfParse(buffer)
      extractedText = pdfData.text
    } catch (parseError) {
      console.error("PDF Parsing Error:", parseError)
      // Even if parsing fails, we don't necessarily want to fail the whole upload.
      // But we will log it.
    }

    // 4. Extract Skills
    const skills = extractSkillsFromText(extractedText)

    // 5. Save to Database
    const resume = await prisma.resume.create({
      data: {
        title,
        fileUrl,
        extractedText,
        skills,
        userId: session.user.id,
      },
    })

    return NextResponse.json(resume, { status: 201 })
  } catch (error) {
    console.error("Upload Route Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
