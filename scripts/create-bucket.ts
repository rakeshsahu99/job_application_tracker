import { createClient } from "@supabase/supabase-js"
import * as dotenv from "dotenv"

dotenv.config({ path: ".env" })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SECRET_KEY!

const supabaseAdmin = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
})

async function main() {
  const { data, error } = await supabaseAdmin.storage.createBucket('resumes', {
    public: true,
    allowedMimeTypes: ['application/pdf'],
    fileSizeLimit: 5242880 // 5MB
  })

  if (error) {
    if (error.message.includes('already exists') || error.message.includes('duplicate')) {
      console.log("Bucket 'resumes' already exists. We are good to go!")
    } else {
      console.error("Failed to create bucket:", error.message)
    }
  } else {
    console.log("Successfully created public bucket 'resumes'.")
  }
}

main()
