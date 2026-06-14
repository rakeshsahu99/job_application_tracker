import NextAuth from "next-auth"
import { authOptions } from "@/lib/auth"

// Automatically correct NEXTAUTH_URL for Vercel deployments if it is missing or points to localhost
if (process.env.NODE_ENV === "production" && process.env.VERCEL_URL) {
  if (!process.env.NEXTAUTH_URL || process.env.NEXTAUTH_URL.includes("localhost")) {
    process.env.NEXTAUTH_URL = `https://${process.env.VERCEL_URL}`
    console.log(`[NextAuth] Auto-corrected NEXTAUTH_URL to: ${process.env.NEXTAUTH_URL}`)
  }
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }

