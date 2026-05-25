import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/session';
import { prisma } from '@/lib/db/prisma';
import { matchResumeWithJob } from '@/lib/ai/matcher';
import { fetchAndParsePdf } from '@/lib/ai/parser';

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || !user.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { resumeId, jobDescription } = body;

    if (!resumeId || !jobDescription) {
      return NextResponse.json({ message: 'Missing resumeId or jobDescription' }, { status: 400 });
    }

    // Fetch resume
    const resume = await prisma.resume.findUnique({
      where: { id: resumeId, userId: user.id }
    });

    if (!resume) {
      return NextResponse.json({ message: 'Resume not found' }, { status: 404 });
    }

    let resumeText = resume.extractedText;

    // Fallback: If text wasn't extracted during upload, extract it now
    if (!resumeText) {
      try {
        resumeText = await fetchAndParsePdf(resume.fileUrl);
        // Save it back to the DB for future use
        await prisma.resume.update({
          where: { id: resumeId },
          data: { extractedText: resumeText }
        });
      } catch (parseError) {
        return NextResponse.json({ message: 'Failed to extract text from the resume PDF.' }, { status: 500 });
      }
    }

    if (!resumeText || resumeText.trim().length === 0) {
        return NextResponse.json({ message: 'Resume contains no readable text.' }, { status: 400 });
    }

    // Call the AI Matcher
    const matchResult = await matchResumeWithJob(resumeText, jobDescription);

    // Save the match result to the database
    const savedMatch = await prisma.resumeMatch.create({
      data: {
        score: matchResult.score,
        missingSkills: matchResult.missingSkills,
        matchingSkills: matchResult.matchingSkills,
        suggestions: matchResult.suggestions,
        summary: matchResult.summary,
        jobDescription: jobDescription,
        resumeId: resumeId,
        userId: user.id
      }
    });

    return NextResponse.json(savedMatch, { status: 200 });
  } catch (error: unknown) {
    const err = error as any;
    console.error('Error in AI match route:', err);
    return NextResponse.json({ message: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
