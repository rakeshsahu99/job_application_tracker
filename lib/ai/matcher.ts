import Groq from 'groq-sdk';
import { z } from 'zod';
import { ATS_EVALUATOR_SYSTEM_PROMPT, buildMatchUserPrompt, SKILL_EXTRACTION_SYSTEM_PROMPT, buildSkillExtractionUserPrompt } from './prompts';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export const ResumeMatchSchema = z.object({
  score: z.number().min(0).max(100),
  missingSkills: z.array(z.string()),
  matchingSkills: z.array(z.string()),
  suggestions: z.string(),
  summary: z.string(),
});

export type ResumeMatchResult = z.infer<typeof ResumeMatchSchema>;

const COMMON_TECH_SKILLS = [
  "React", "Node.js", "MongoDB", "Docker", "AWS", "Python", "Java", "C++", "C#", "Go",
  "SQL", "NoSQL", "PostgreSQL", "MySQL", "Redis", "GraphQL", "REST API", "TypeScript",
  "JavaScript", "HTML", "CSS", "TailwindCSS", "Next.js", "Vue", "Angular", "Express",
  "Django", "Flask", "Spring Boot", "Kubernetes", "CI/CD", "Git", "GitHub", "GitLab",
  "Linux", "Azure", "GCP", "Firebase", "Supabase", "Prisma", "Redux", "Zustand"
];

function extractExplicitSkills(text: string): string[] {
  const textLower = text.toLowerCase();
  return COMMON_TECH_SKILLS.filter(skill => {
    const escapedSkill = skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`\\b${escapedSkill}\\b`, 'i');
    
    if (!regex.test(textLower) && ['c++', 'c#', 'node.js', '.net'].includes(skill.toLowerCase())) {
        return textLower.includes(skill.toLowerCase());
    }
    return regex.test(textLower);
  });
}

export async function matchResumeWithJob(resumeText: string, jobDescription: string): Promise<ResumeMatchResult> {
  const resumeSkills = extractExplicitSkills(resumeText);
  const jdSkills = extractExplicitSkills(jobDescription);
  
  const explicitMatchingSkills = jdSkills.filter(skill => resumeSkills.includes(skill));
  const explicitMissingSkills = jdSkills.filter(skill => !resumeSkills.includes(skill));

  let userPrompt = buildMatchUserPrompt(resumeText, jobDescription);
  userPrompt += `\n\n[SYSTEM HINT]: 
Explicit required skills found in Job Description: ${jdSkills.join(', ')}
Explicit skills found in Candidate Resume: ${resumeSkills.join(', ')}
Pre-calculated Overlap: ${explicitMatchingSkills.join(', ')}
Pre-calculated Missing: ${explicitMissingSkills.join(', ')}
Use these hints to form your final analysis and calculate a realistic score.`;

  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: ATS_EVALUATOR_SYSTEM_PROMPT },
        { role: 'user', content: userPrompt }
      ],
      model: 'llama3-70b-8192',
      temperature: 0.1,
      response_format: { type: 'json_object' }
    });

    const content = chatCompletion.choices[0]?.message?.content || '{}';
    
    let parsedJson;
    try {
      parsedJson = JSON.parse(content);
    } catch (parseError) {
      const cleanContent = content.replace(/```json/g, '').replace(/```/g, '').trim();
      parsedJson = JSON.parse(cleanContent);
    }

    // Validate using Zod
    const validatedResult = ResumeMatchSchema.parse(parsedJson);
    return validatedResult;

  } catch (error: any) {
    console.error('Error during AI matching:', error);
    throw new Error(error.message || 'Failed to analyze resume match');
  }
}

export const SkillExtractionSchema = z.object({
  skills: z.array(z.string())
});

export async function extractSkillsWithAI(resumeText: string): Promise<string[]> {
  try {
    const userPrompt = buildSkillExtractionUserPrompt(resumeText);
    
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: SKILL_EXTRACTION_SYSTEM_PROMPT },
        { role: 'user', content: userPrompt }
      ],
      model: 'llama3-8b-8192',
      temperature: 0.1,
      response_format: { type: 'json_object' }
    });

    const content = chatCompletion.choices[0]?.message?.content || '{"skills":[]}';
    
    let parsedJson;
    try {
      parsedJson = JSON.parse(content);
    } catch (parseError) {
      const cleanContent = content.replace(/```json/g, '').replace(/```/g, '').trim();
      parsedJson = JSON.parse(cleanContent);
    }

    const validatedResult = SkillExtractionSchema.parse(parsedJson);
    return validatedResult.skills;

  } catch (error: any) {
    console.error('Error during AI skill extraction:', error);
    // Fallback to explicit regex matching if AI fails
    return extractExplicitSkills(resumeText);
  }
}
