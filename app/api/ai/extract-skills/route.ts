import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/session';
import { extractSkillsWithAI } from '@/lib/ai/matcher';
import { cleanResumeText } from '@/lib/ai/cleaner';

// Simple in-memory rate limiting (for development)
const rateLimitMap = new Map<string, { count: number, resetAt: number }>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 10;

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
    const { resumeText } = body;

    if (!resumeText) {
      return NextResponse.json({ message: 'Missing resumeText' }, { status: 400 });
    }

    const cleanedText = cleanResumeText(resumeText);
    
    if (cleanedText.length < 50) {
      return NextResponse.json({ message: 'Resume text is too short to extract skills.' }, { status: 400 });
    }

    const skills = await extractSkillsWithAI(cleanedText);

    return NextResponse.json({ skills }, { status: 200 });
  } catch (error: unknown) {
    const err = error as any;
    console.error('Error in AI skill extraction route:', err);
    return NextResponse.json({ message: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
