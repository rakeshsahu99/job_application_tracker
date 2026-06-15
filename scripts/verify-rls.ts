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
    console.log("Verifying Row Level Security (RLS) status on public tables...")
    const tableRes = await client.query(`
      SELECT tablename, rowsecurity 
      FROM pg_tables 
      WHERE schemaname = 'public' AND tablename IN (
        'User', 'Resume', 'JobApplication', 'Reminder', 'Interview', 'AutomationTask', 'ResumeMatch'
      );
    `)

    console.log("\nTable RLS Status:")
    console.table(tableRes.rows)

    const allRLSEnabled = tableRes.rows.every(row => row.rowsecurity === true)
    if (allRLSEnabled && tableRes.rows.length === 7) {
      console.log("✅ All 7 tables have Row Level Security enabled.")
    } else {
      console.warn("⚠️ Warning: Not all tables have RLS enabled, or some tables are missing.")
    }

    console.log("\nVerifying RLS Policies...")
    const policyRes = await client.query(`
      SELECT tablename, policyname, roles, cmd 
      FROM pg_policies 
      WHERE schemaname = 'public' AND tablename IN (
        'User', 'Resume', 'JobApplication', 'Reminder', 'Interview', 'AutomationTask', 'ResumeMatch'
      );
    `)

    console.log("Active Policies:")
    console.table(policyRes.rows)

    if (policyRes.rows.length === 7) {
      console.log("✅ All 7 policies are correctly configured.")
    } else {
      console.warn(`⚠️ Warning: Expected 7 policies, but found ${policyRes.rows.length}.`)
    }

  } catch (err: any) {
    console.error("Verification failed:", err.message)
    process.exit(1)
  } finally {
    client.release()
    await pool.end()
  }
}

main()
