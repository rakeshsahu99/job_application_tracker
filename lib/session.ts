import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

/**
 * Retrieves the currently authenticated user session on the server-side.
 * Safe for use in Server Components, Server Actions, and Route Handlers.
 */
export async function getCurrentUser() {
  const session = await getServerSession(authOptions)
  return session?.user
}
