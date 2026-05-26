import { generateStructuredJson } from "../providers/groq";
import { INTERVIEW_PREP_SYSTEM_PROMPT, buildInterviewPrepUserPrompt } from "../prompts/interview";

export interface InterviewQuestion {
  question: string;
  expectedAnswer: string;
}

export interface InterviewPrepResult {
  technicalQuestions: InterviewQuestion[];
  behavioralQuestions: InterviewQuestion[];
  weakSpotQuestions: InterviewQuestion[];
}

/**
 * Generates custom interview questions based on the gap between a candidate's resume
 * and the specific job they are applying for.
 */
export async function generateInterviewPrep(
  resumeText: string,
  jobDescription: string
): Promise<InterviewPrepResult> {
  const userPrompt = buildInterviewPrepUserPrompt(resumeText, jobDescription);

  return generateStructuredJson<InterviewPrepResult>(
    INTERVIEW_PREP_SYSTEM_PROMPT,
    userPrompt,
    { temperature: 0.5, maxRetries: 3 } // Slightly higher temp for creative question generation
  );
}
