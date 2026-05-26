# Developer Setup Guide

Welcome to the Automated Job Application Tracker! Follow these instructions to get your local environment running.

## Prerequisites
- Node.js (v20+ recommended)
- npm or yarn or pnpm
- PostgreSQL (e.g., Supabase Free Tier)
- Redis (e.g., Upstash or local Redis instance for BullMQ)
- Playwright browsers installed locally

## 1. Clone & Install
```bash
git clone https://github.com/your-username/ai-job-application-tracker.git
cd ai-job-application-tracker
npm install
```

## 2. Environment Variables
Copy `.env.example` to `.env` (create `.env` if not present) and fill in the following:

```env
# Database (Supabase)
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@db.YOUR_PROJECT.supabase.co:5432/postgres"

# Next Auth
NEXTAUTH_SECRET="your-secret-here"
NEXTAUTH_URL="http://localhost:3000"

# AI Integration (Groq)
GROQ_API_KEY="your-groq-api-key"

# Queue (Redis)
REDIS_URL="redis://default:YOUR_PASSWORD@your-redis-url:6379"
```

## 3. Database Setup
We use Prisma as our ORM. Run the following commands to initialize the database:
```bash
npx prisma generate
npx prisma db push
```

## 4. Install Automation Browsers
Playwright requires browser binaries to run:
```bash
npx playwright install
```

## 5. Run the Application
Start the Next.js development server:
```bash
npm run dev
```

Start the background worker process (in a separate terminal) if you want to test automation queues:
```bash
npm run worker
```

## 6. Testing
We use Vitest and Playwright. Run tests with:
```bash
npm run test
```
