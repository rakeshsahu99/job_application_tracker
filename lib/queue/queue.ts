import { Queue } from "bullmq";
import { redis } from "./redis";

export const automationQueueName = "automation-queue";

export const automationQueue = new Queue(automationQueueName, {
  connection: redis,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 5000, // 5s, 10s, 20s...
    },
    removeOnComplete: false, // Keep for logs initially
    removeOnFail: false,
  },
});

export const addAutomationJob = async (
  jobType: "auto-apply" | "follow-up reminder" | "resume parsing" | "job scraping",
  data: any,
  options?: any
) => {
  return await automationQueue.add(jobType, data, options);
};
