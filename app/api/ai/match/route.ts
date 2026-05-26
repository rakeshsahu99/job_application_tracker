import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/session';
import { prisma } from '@/lib/db/prisma';
import { calculateJobFit } from '@/lib/ai/scoring/jobFit';
import { fetchAndParsePdf } from '@/lib/ai/parser';
import { cleanResumeText } from '@/lib/ai/cleaner';

export const dynamic = 'force-dynamic';

// Simple in-memory rate limiting (for development)
const rateLimitMap = new Map<string, { count: number, resetAt: number }>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 5;

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || !user.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Check Rate Limit
    const now = Date.now();
    let rateLimit = rateLimitMap.get(user.id);
    
    if (!rateLimit || rateLimit.resetAt < now) {
      rateLimitMap.set(user.id, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    } else {
      if (rateLimit.count >= MAX_REQUESTS_PER_WINDOW) {
        return NextResponse.json({ message: 'Too many requests. Please try again later.' }, { status: 429 });
      }
      rateLimit.count += 1;
      rateLimitMap.set(user.id, rateLimit);
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

    let resumeText = resume.parsedText;

    // Fallback: If text wasn't extracted during upload, extract it now
    if (!resumeText) {
      try {
        resumeText = await fetchAndParsePdf(resume.resumeUrl);
        // Save it back to the DB for future use
        await prisma.resume.update({
          where: { id: resumeId },
          data: { parsedText: resumeText }
        });
      } catch (parseError) {
        return NextResponse.json({ message: 'Failed to extract text from the resume PDF.' }, { status: 500 });
      }
    }

    if (!resumeText || resumeText.trim().length === 0) {
        return NextResponse.json({ message: 'Resume contains no readable text.' }, { status: 400 });
    }

    // Clean the text
    const cleanedResumeText = cleanResumeText(resumeText);
    const cleanedJobDescription = cleanResumeText(jobDescription); // Reuse cleaner for JD to normalize spacing

    // Call the AI Matcher
    const matchResult = await calculateJobFit(cleanedResumeText, cleanedJobDescription);

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
