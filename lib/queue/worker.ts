import { Worker, Job } from "bullmq";
import { redis } from "./redis";
import { prisma } from "../db/prisma";
import { processAutomationTask } from "../automation/worker";
const automationQueueName = "automation-queue";

export const worker = new Worker(
  automationQueueName,
  async (job: Job) => {
    const { taskId, ...jobData } = job.data;
    
    console.log(`\n[Worker] Started processing job ${job.id} of type "${job.name}"`);
    
    if (taskId) {
      await prisma.automationTask.update({
        where: { id: taskId },
        data: { status: "RUNNING" },
      });
    }

    try {
      // Route job types to the corresponding automation logic
      if (job.name === "auto-apply") {
        console.log(`[Worker] Auto-applying with data:`, jobData);
        if (!taskId) {
          throw new Error("Cannot run auto-apply without a taskId");
        }
        const result = await processAutomationTask(taskId);
        if (!result.success) {
          throw new Error(result.error || "Automation failed");
        }
      } else if (job.name === "follow-up reminder") {
        console.log(`[Worker] Follow-up reminder with data:`, jobData);
        await new Promise((resolve) => setTimeout(resolve, 2000));
      } else if (job.name === "resume parsing") {
        console.log(`[Worker] Resume parsing with data:`, jobData);
        await new Promise((resolve) => setTimeout(resolve, 3000));
      } else if (job.name === "job scraping") {
        console.log(`[Worker] Job scraping with data:`, jobData);
        await new Promise((resolve) => setTimeout(resolve, 4000));
      } else {
        throw new Error(`Unknown job type: ${job.name}`);
      }

      if (taskId) {
        await prisma.automationTask.update({
          where: { id: taskId },
          data: {
            status: "COMPLETED",
            completedAt: new Date(),
            logs: `Successfully processed ${job.name} at ${new Date().toISOString()}.`,
          },
        });
      }
      
      console.log(`[Worker] Finished processing job ${job.id}`);
      return { success: true };
    } catch (error: any) {
      console.error(`[Worker] Job ${job.id} failed:`, error.message);
      
      if (taskId) {
        const existingTask = await prisma.automationTask.findUnique({
          where: { id: taskId },
        });

        await prisma.automationTask.update({
          where: { id: taskId },
          data: {
            status: "FAILED",
            logs: error.message || "Unknown error occurred.",
            retryCount: (existingTask?.retryCount || 0) + 1,
          },
        });
      }
      throw error;
    }
  },
  {
    connection: redis,
    concurrency: 5, // Process up to 5 jobs concurrently
  }
);

worker.on("ready", () => {
  console.log(`\n[Worker] Listening to queue: ${automationQueueName}...`);
  console.log(`[Worker] Ready to process background tasks.`);
});

worker.on("error", (err) => {
  console.error(`[Worker] Error:`, err);
});
