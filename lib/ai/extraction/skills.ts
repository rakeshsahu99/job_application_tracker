import { generateStructuredJson } from "../providers/groq";
import { SKILL_EXTRACTION_SYSTEM_PROMPT, buildSkillExtractionUserPrompt } from "../prompts/extraction";

export interface SkillExtractionResult {
  skills: string[];
}

/**
 * Extracts skills from a given resume text.
 */
export async function extractSkills(resumeText: string): Promise<string[]> {
  const userPrompt = buildSkillExtractionUserPrompt(resumeText);

  try {
    const result = await generateStructuredJson<SkillExtractionResult>(
      SKILL_EXTRACTION_SYSTEM_PROMPT,
      userPrompt,
      { temperature: 0.1 }
    );
    return result.skills || [];
  } catch (error) {
    console.error("Skill extraction failed:", error);
    return [];
  }
}
