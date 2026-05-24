/**
 * A utility to extract known skills from raw text.
 */

const KNOWN_SKILLS = [
  // Frontend
  "React", "Vue", "Angular", "Next.js", "Nuxt", "Svelte", "HTML", "CSS", "TailwindCSS", "SASS", "Redux", "Zustand", "TypeScript", "JavaScript",
  
  // Backend
  "Node.js", "Express", "NestJS", "Python", "Django", "Flask", "FastAPI", "Java", "Spring Boot", "C#", ".NET", "Ruby", "Ruby on Rails", "Go", "Golang", "Rust", "PHP", "Laravel", "C++",
  
  // Database
  "PostgreSQL", "MySQL", "MongoDB", "Redis", "SQLite", "Firebase", "Supabase", "DynamoDB", "Cassandra", "Oracle", "SQL Server", "Prisma", "TypeORM", "Mongoose",
  
  // DevOps & Cloud
  "Docker", "Kubernetes", "AWS", "Amazon Web Services", "Azure", "Google Cloud", "GCP", "Terraform", "Ansible", "Jenkins", "GitHub Actions", "GitLab CI", "Linux", "Nginx", "Apache",
  
  // Other Tools & Concepts
  "Git", "GitHub", "GitLab", "Bitbucket", "REST API", "GraphQL", "gRPC", "WebSockets", "Microservices", "Agile", "Scrum", "Jira", "Figma", "Machine Learning", "AI", "NLP"
]

export function extractSkillsFromText(text: string): string[] {
  if (!text) return []

  const detectedSkills = new Set<string>()
  const normalizedText = text.toLowerCase()

  for (const skill of KNOWN_SKILLS) {
    // We use word boundaries to avoid partial matches (e.g., "go" inside "good")
    // Note: We need to escape special regex characters like '+', '.', etc.
    const escapedSkill = skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    
    // For words that are purely alphabetic/numeric, we can use \b
    // For others (like C++, .NET, Next.js), \b might not work perfectly due to non-word chars.
    // A slightly robust approach:
    const regex = new RegExp(`(?:^|[^a-zA-Z0-9_])(${escapedSkill})(?:[^a-zA-Z0-9_]|$)`, 'i')
    
    if (regex.test(normalizedText)) {
      detectedSkills.add(skill)
    }
  }

  return Array.from(detectedSkills)
}
