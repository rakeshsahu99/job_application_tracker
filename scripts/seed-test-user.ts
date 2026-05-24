import { prisma } from "../lib/db/prisma"
import bcrypt from "bcryptjs"

async function main() {
  const email = "test@example.com"
  const password = "password123"

  const existingUser = await prisma.user.findUnique({
    where: { email },
  })

  if (!existingUser) {
    const hashedPassword = await bcrypt.hash(password, 10)
    await prisma.user.create({
      data: {
        name: "Test User",
        email,
        password: hashedPassword,
      },
    })
    console.log(`Created test user with email ${email}`)
  } else {
    const isPasswordValid = await bcrypt.compare(password, existingUser.password || "")
    if (!isPasswordValid) {
      console.log(`User exists but password doesn't match 'password123'. Updating password...`)
      const hashedPassword = await bcrypt.hash(password, 10)
      await prisma.user.update({
        where: { email },
        data: { password: hashedPassword },
      })
      console.log(`Updated test user password to 'password123'`)
    } else {
      console.log(`Test user already exists and password matches.`)
    }
  }

  // Check if they have applications
  const user = await prisma.user.findUnique({ where: { email } })
  if (user) {
    const apps = await prisma.jobApplication.findMany({ where: { userId: user.id } })
    console.log(`User has ${apps.length} applications.`)
    if (apps.length === 0) {
      await prisma.jobApplication.create({
        data: {
          company: "Google",
          role: "Full Stack Engineer",
          status: "APPLIED",
          userId: user.id,
        }
      })
      console.log(`Created a dummy Google application.`)
    }
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    // Wait for prisma to finish
  })
