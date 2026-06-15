import "dotenv/config"
import pg from "pg"

const databaseUrl = process.env.DATABASE_URL
if (!databaseUrl) {
  console.error("DATABASE_URL is not defined in the environment variables.")
  process.exit(1)
}

async function main() {
  const pool = new pg.Pool({
    connectionString: databaseUrl,
    connectionTimeoutMillis: 5000,
  })

  const client = await pool.connect()

  try {
    console.log("Enabling Row Level Security (RLS) on all public tables...")
    await client.query(`
      ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
      ALTER TABLE "Resume" ENABLE ROW LEVEL SECURITY;
      ALTER TABLE "JobApplication" ENABLE ROW LEVEL SECURITY;
      ALTER TABLE "Reminder" ENABLE ROW LEVEL SECURITY;
      ALTER TABLE "Interview" ENABLE ROW LEVEL SECURITY;
      ALTER TABLE "AutomationTask" ENABLE ROW LEVEL SECURITY;
      ALTER TABLE "ResumeMatch" ENABLE ROW LEVEL SECURITY;
    `)
    console.log("RLS enabled successfully.")

    console.log("Dropping existing RLS policies if they exist (to ensure idempotency)...")
    await client.query(`
      DROP POLICY IF EXISTS "Users can only access their own user record" ON "User";
      DROP POLICY IF EXISTS "Users can only access their own resumes" ON "Resume";
      DROP POLICY IF EXISTS "Users can only access their own job applications" ON "JobApplication";
      DROP POLICY IF EXISTS "Users can only access reminders of their own applications" ON "Reminder";
      DROP POLICY IF EXISTS "Users can only access interviews of their own applications" ON "Interview";
      DROP POLICY IF EXISTS "Users can only access automation tasks of their own applications" ON "AutomationTask";
      DROP POLICY IF EXISTS "Users can only access their own resume matches" ON "ResumeMatch";
    `)

    console.log("Creating secure RLS policies for each table...")
    await client.query(`
      CREATE POLICY "Users can only access their own user record" ON "User" 
        FOR ALL USING (id = auth.uid()::text);

      CREATE POLICY "Users can only access their own resumes" ON "Resume" 
        FOR ALL USING ("userId" = auth.uid()::text);

      CREATE POLICY "Users can only access their own job applications" ON "JobApplication" 
        FOR ALL USING ("userId" = auth.uid()::text);

      CREATE POLICY "Users can only access reminders of their own applications" ON "Reminder" 
        FOR ALL USING (EXISTS (
          SELECT 1 FROM "JobApplication" 
          WHERE "JobApplication".id = "Reminder"."applicationId" 
            AND "JobApplication"."userId" = auth.uid()::text
        ));

      CREATE POLICY "Users can only access interviews of their own applications" ON "Interview" 
        FOR ALL USING (EXISTS (
          SELECT 1 FROM "JobApplication" 
          WHERE "JobApplication".id = "Interview"."applicationId" 
            AND "JobApplication"."userId" = auth.uid()::text
        ));

      CREATE POLICY "Users can only access automation tasks of their own applications" ON "AutomationTask" 
        FOR ALL USING (EXISTS (
          SELECT 1 FROM "JobApplication" 
          WHERE "JobApplication".id = "AutomationTask"."applicationId" 
            AND "JobApplication"."userId" = auth.uid()::text
        ));

      CREATE POLICY "Users can only access their own resume matches" ON "ResumeMatch" 
        FOR ALL USING ("userId" = auth.uid()::text);
    `)
    console.log("RLS policies created successfully.")
  } catch (err: any) {
    console.error("Error setting up RLS and policies:", err.message)
    process.exit(1)
  } finally {
    client.release()
    await pool.end()
  }
}

main()
