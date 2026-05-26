import { generateStructuredJson } from "../providers/groq";
import { ATS_EVALUATOR_SYSTEM_PROMPT, buildMatchUserPrompt } from "../prompts/scoring";

export interface JobFitMatchResult {
  score: number;
  missingSkills: string[];
  matchingSkills: string[];
  suggestions: string;
  summary: string;
}

/**
 * Calculates a job fit score by comparing a candidate's resume against a job description.
 */
export async function calculateJobFit(
  resumeText: string,
  jobDescription: string
): Promise<JobFitMatchResult> {
  const userPrompt = buildMatchUserPrompt(resumeText, jobDescription);

  return generateStructuredJson<JobFitMatchResult>(
    ATS_EVALUATOR_SYSTEM_PROMPT,
    userPrompt,
    { temperature: 0.2 } // Low temperature for deterministic scoring
  );
}
