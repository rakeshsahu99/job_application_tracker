import { generateStructuredJson } from "../providers/groq";
import { RESUME_IMPROVEMENT_SYSTEM_PROMPT, buildResumeImprovementUserPrompt } from "../prompts/recommendations";

export interface ActionableImprovement {
  section: string;
  suggestion: string;
  example: string;
}

export interface ResumeImprovementResult {
  generalFeedback: string;
  actionableImprovements: ActionableImprovement[];
  estimatedImpact: "High" | "Medium" | "Low";
}

/**
 * Generates an actionable improvement plan for a given resume text.
 */
export async function generateResumeImprovements(
  resumeText: string
): Promise<ResumeImprovementResult> {
  const userPrompt = buildResumeImprovementUserPrompt(resumeText);

  return generateStructuredJson<ResumeImprovementResult>(
    RESUME_IMPROVEMENT_SYSTEM_PROMPT,
    userPrompt,
    { temperature: 0.3 }
  );
}
