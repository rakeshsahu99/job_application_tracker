import { getBrowser, getContext, saveCookies, closeBrowser } from './browser';
import { applyToGreenhouse, ApplicationData } from './greenhouse';
import { applyToLever } from './lever';
import { prisma } from '../db/prisma'; // Adjust based on your prisma client export location

export async function processAutomationTask(taskId: string) {
  try {
    // 1. Fetch task details from database
    const task = await prisma.automationTask.findUnique({
      where: { id: taskId },
      include: {
        application: {
          include: {
            user: true,
            resume: true,
          }
        }
      }
    });

    if (!task || !task.application) {
      throw new Error('Task or associated application not found.');
    }

    // Update status to processing
    await prisma.automationTask.update({
      where: { id: taskId },
      data: { status: 'RUNNING' }
    });

    const jobUrl = task.application.jobUrl;
    if (!jobUrl) {
      throw new Error('No job URL provided.');
    }

    // 2. Prepare data for the automation script
    // In a real scenario, you'd download the resume PDF from task.application.resume.fileUrl to a temp folder.
    // Here we assume a dummy or existing local path for testing if resume is missing.
    const applicationData: ApplicationData = {
      firstName: task.application.user.name.split(' ')[0] || 'John',
      lastName: task.application.user.name.split(' ').slice(1).join(' ') || 'Doe',
      email: task.application.user.email,
      phone: '123-456-7890', // Hardcoded for demo, you'd add this to User profile
      resumePath: process.cwd() + '/public/dummy_resume.pdf', // Using a local dummy file for now
      linkedIn: 'https://linkedin.com/in/johndoe'
    };

    // 3. Launch browser
    const browser = await getBrowser();
    const context = await getContext(browser, task.application.userId); // persistent session per user
    const page = await context.newPage();

    // 4. Route to the correct platform script
    if (jobUrl.includes('greenhouse.io') || task.platform === 'greenhouse') {
      await applyToGreenhouse(page, jobUrl, applicationData);
    } else if (jobUrl.includes('jobs.lever.co') || task.platform === 'lever') {
      await applyToLever(page, jobUrl, applicationData);
    } else {
      // Fallback or generic handling (e.g., lever, workable)
      console.log('Unsupported platform or generic URL. Attempting generic form fill...');
      await page.goto(jobUrl, { waitUntil: 'networkidle' });
      // Stop for manual intervention
      console.log('Please review and fill the form manually.');
    }

    // Save session cookies for next time
    await saveCookies(context, task.application.userId);

    // 5. Update task status (Wait for user confirmation in a real app, here we just mark as ready for review)
    await prisma.automationTask.update({
      where: { id: taskId },
      data: { status: 'COMPLETED', logs: 'Form filled. Waiting for user to submit.' }
    });

    // NOTE: In semi-automation, we intentionally do NOT close the browser immediately
    // so the user can review and click submit!
    // If you want to close it after a timeout or on submit, you'd handle it here.
    
    return { success: true, message: 'Automation paused for review.' };

  } catch (error: any) {
    console.error('Automation failed:', error);
    await prisma.automationTask.update({
      where: { id: taskId },
      data: { status: 'FAILED', logs: error.message }
    });
    // In case of error, you might want to close the browser to free resources
    await closeBrowser();
    return { success: false, error: error.message };
  }
}
