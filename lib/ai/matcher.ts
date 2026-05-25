import axios from 'axios';
import { ATS_EVALUATOR_SYSTEM_PROMPT, buildMatchUserPrompt } from './prompts';

export interface ResumeMatchResult {
  score: number;
  missingSkills: string[];
  matchingSkills: string[];
  suggestions: string;
  summary: string;
}

const COMMON_TECH_SKILLS = [
  "React", "Node.js", "MongoDB", "Docker", "AWS", "Python", "Java", "C++", "C#", "Go",
  "SQL", "NoSQL", "PostgreSQL", "MySQL", "Redis", "GraphQL", "REST API", "TypeScript",
  "JavaScript", "HTML", "CSS", "TailwindCSS", "Next.js", "Vue", "Angular", "Express",
  "Django", "Flask", "Spring Boot", "Kubernetes", "CI/CD", "Git", "GitHub", "GitLab",
  "Linux", "Azure", "GCP", "Firebase", "Supabase", "Prisma", "Redux", "Zustand"
];

function extractSkills(text: string): string[] {
  const textLower = text.toLowerCase();
  return COMMON_TECH_SKILLS.filter(skill => {
    // Match exact word to avoid partial matches (e.g., 'go' inside 'good')
    // Handle special characters in skills like 'C++', 'Node.js'
    const escapedSkill = skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`\\b${escapedSkill}\\b`, 'i');
    
    // Fallback for skills that might not have word boundaries like C++
    if (!regex.test(textLower) && ['c++', 'c#', 'node.js', '.net'].includes(skill.toLowerCase())) {
        return textLower.includes(skill.toLowerCase());
    }
    
    return regex.test(textLower);
  });
}

export async function matchResumeWithJob(resumeText: string, jobDescription: string): Promise<ResumeMatchResult> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error('GROQ_API_KEY is not configured in the environment variables.');
  }

  // Pre-calculate skill overlap to help the AI produce more realistic scores
  const resumeSkills = extractSkills(resumeText);
  const jdSkills = extractSkills(jobDescription);
  
  const explicitMatchingSkills = jdSkills.filter(skill => resumeSkills.includes(skill));
  const explicitMissingSkills = jdSkills.filter(skill => !resumeSkills.includes(skill));

  const systemPrompt = ATS_EVALUATOR_SYSTEM_PROMPT;
  
  // Inject the pre-calculated skills into the prompt as hints
  let userPrompt = buildMatchUserPrompt(resumeText, jobDescription);
  userPrompt += `\n\n[SYSTEM HINT]: 
Explicit required skills found in Job Description: ${jdSkills.join(', ')}
Explicit skills found in Candidate Resume: ${resumeSkills.join(', ')}
Pre-calculated Overlap: ${explicitMatchingSkills.join(', ')}
Pre-calculated Missing: ${explicitMissingSkills.join(', ')}
Use these hints to form your final analysis and calculate a realistic score.`;

  try {
    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: 'llama3-70b-8192',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.1, // Low temperature for deterministic JSON output
        response_format: { type: "json_object" }
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const content = response.data.choices[0].message.content;
    
    let parsedResult: ResumeMatchResult;
    try {
      parsedResult = JSON.parse(content);
    } catch (parseError) {
      // AI sometimes returns markdown code block despite json_object mode
      const cleanContent = content.replace(/```json/g, '').replace(/```/g, '').trim();
      parsedResult = JSON.parse(cleanContent);
    }

    // Basic validation
    if (typeof parsedResult.score !== 'number' || !Array.isArray(parsedResult.missingSkills)) {
      throw new Error('Invalid response format from AI provider.');
    }

    return parsedResult;
  } catch (error: unknown) {
    const err = error as any;
    console.error('Error during AI matching:', err.response?.data || err.message);
    throw new Error(err.response?.data?.error?.message || 'Failed to analyze resume match');
  }
}
