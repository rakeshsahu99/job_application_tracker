import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { processAutomationTask } from '@/lib/automation/worker';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { applicationId, jobUrl } = await req.json();

    if (!applicationId || !jobUrl) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Ensure the application belongs to the user
    const application = await prisma.jobApplication.findFirst({
      where: {
        id: applicationId,
        userId: session.user.id
      }
    });

    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    // Create an automation task
    const task = await prisma.automationTask.create({
      data: {
        platform: jobUrl.includes('greenhouse.io') ? 'greenhouse' : 'unknown',
        status: 'QUEUED',
        applicationId: applicationId,
      }
    });

    // In a production environment, you would push the taskId to a queue (e.g., Redis, SQS, or Vercel Inngest).
    // For development, we run it locally and async (do not await, to return response immediately, or await to debug).
    
    // We run it asynchronously in the background so the request doesn't timeout.
    processAutomationTask(task.id).catch(console.error);

    return NextResponse.json({ message: 'Automation started', taskId: task.id });
  } catch (error: any) {
    console.error('Failed to start automation:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
