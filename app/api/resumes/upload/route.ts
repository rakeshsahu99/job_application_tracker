import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db/prisma"
import { supabaseAdmin } from "@/lib/supabase"

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

    // 1. Convert File to ArrayBuffer, then to Buffer for fs and pdf-parse
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // 2. Save file to Supabase Storage
    const timestamp = Date.now()
    const fileExt = file.name.split('.').pop()
    const fileName = `${session.user.id}-${timestamp}.${fileExt}`
    
    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from("resumes")
      .upload(fileName, buffer, {
        contentType: "application/pdf",
        upsert: true,
      })

    if (uploadError) {
      console.error("Supabase Storage Upload Error:", uploadError)
      throw new Error(`Failed to upload file to storage: ${uploadError.message}`)
    }

    // Get the public URL for the uploaded file
    const { data: { publicUrl } } = supabaseAdmin.storage
      .from("resumes")
      .getPublicUrl(fileName)

    const resumeUrl = publicUrl

    // 3. Extract text using pdf-parse (supporting both modern class-based and classic function-based shapes)
    let parsedText = ""
    try {
      const pdfParseModule = require("pdf-parse")
      
      // Check for modern class-based library
      let PDFParseClass = pdfParseModule.PDFParse
      if (!PDFParseClass && pdfParseModule.default) {
        PDFParseClass = pdfParseModule.default.PDFParse
      }
      
      if (PDFParseClass) {
        const parser = new PDFParseClass({ data: buffer })
        const result = await parser.getText()
        parsedText = result.text || ""
      } else {
        // Fallback to classic function-based
        let pdfParseFn = pdfParseModule
        if (pdfParseFn.default) {
          pdfParseFn = pdfParseFn.default
        }
        if (typeof pdfParseFn === "function") {
          const pdfData = await pdfParseFn(buffer)
          parsedText = pdfData.text || ""
        } else {
          throw new Error("Could not resolve valid PDF parser")
        }
      }
    } catch (parseError) {
      console.error("PDF Parsing Error:", parseError)
      // Even if parsing fails, we proceed
    }

    // 4. Extract Skills
    const skills = extractSkillsFromText(parsedText)

    // 5. Save to Database
    const resume = await prisma.resume.create({
      data: {
        title,
        resumeUrl,
        parsedText,
        skills,
        version: 1,
        userId: session.user.id,
      },
    })

    return NextResponse.json(resume, { status: 201 })
  } catch (error) {
    console.error("Upload Route Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
