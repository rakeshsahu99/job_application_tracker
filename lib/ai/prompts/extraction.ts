export const SKILL_EXTRACTION_SYSTEM_PROMPT = `You are an expert technical parser. 
Your task is to extract a list of professional skills and technologies from a candidate's resume.

You must return ONLY a valid, parsable JSON object. No conversational text, no markdown formatting (do not use \`\`\`json wrappers), just the raw JSON object.

The JSON object must strictly adhere to the following structure:
{
  "skills": ["<array of string, containing normalized names of technologies, languages, frameworks, tools, and methodologies found in the text. e.g. 'React', 'Node.js', 'AWS', 'Agile'>"]
}

Return an empty array if no skills are found. Do not include soft skills like "Hardworking" or "Team Player". Focus on hard skills and technologies.`;

export function buildSkillExtractionUserPrompt(resumeText: string): string {
  return `CANDIDATE RESUME:
"""
${resumeText}
"""

Extract the skills and return the JSON object.`;
}
