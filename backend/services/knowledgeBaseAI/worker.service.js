import { randomUUID } from "crypto";
import KnowledgeBaseJob from "../../models/knowledgeBaseJob.model.js";
import KnowledgeBaseAsset from "../../models/knowledgeBaseAsset.model.js";
import kbConfig from "../../config/kbAI.config.js";
import { processKnowledgeBaseJob, refreshKnowledgeBaseIndexStatus } from "./ingestion.service.js";

const workerId = `kb-worker-${randomUUID()}`;
let timer = null;
let polling = false;

const claimJob = async () => {
  const now = new Date();
  const staleBefore = new Date(now.getTime() - kbConfig.worker.lockTimeout);
  return KnowledgeBaseJob.findOneAndUpdate(
    {
      $or: [
        { status: "Pending", nextRunAt: { $lte: now } },
        { status: "Processing", lockedAt: { $lte: staleBefore } },
      ],
    },
    { $set: { status: "Processing", lockedAt: now, lockedBy: workerId, startedAt: now, error: null }, $inc: { attempts: 1 } },
    { sort: { nextRunAt: 1, createdAt: 1 }, returnDocument: "after" }
  );
};

const runOne = async () => {
  const job = await claimJob();
  if (!job) return false;
  try {
    await KnowledgeBaseAsset.updateOne({ _id: job.asset }, { $set: { indexingStatus: "Processing", extractionStatus: "Processing", error: null } });
    await processKnowledgeBaseJob(job);
    await KnowledgeBaseJob.updateOne({ _id: job._id }, { $set: { status: "Completed", completedAt: new Date(), lockedAt: null, lockedBy: null, error: null } });
  } catch (error) {
    const message = String(error?.message || error).slice(0, 3000);
    const exhausted = job.attempts >= job.maxAttempts;
    const delayMs = Math.min(60 * 60 * 1000, 15000 * (2 ** Math.max(0, job.attempts - 1)));
    await KnowledgeBaseJob.updateOne({ _id: job._id }, {
      $set: {
        status: exhausted ? "Failed" : "Pending",
        nextRunAt: new Date(Date.now() + delayMs),
        lockedAt: null,
        lockedBy: null,
        error: message,
      },
    });
    await KnowledgeBaseAsset.updateOne({ _id: job.asset }, { $set: { indexingStatus: exhausted ? "Failed" : "Pending", extractionStatus: exhausted ? "Failed" : "Pending", error: message } });
  } finally {
    await refreshKnowledgeBaseIndexStatus(job.knowledgeBase).catch((error) => console.error("[KB] status refresh failed", error));
  }
  return true;
};

const poll = async () => {
  if (polling) return;
  polling = true;
  try {
    const tasks = Array.from({ length: kbConfig.worker.concurrency }, () => runOne());
    await Promise.all(tasks);
  } catch (error) {
    console.error("[KB WORKER] polling error:", error);
  } finally {
    polling = false;
  }
};

export const startKnowledgeBaseWorker = () => {
  if (!kbConfig.enabled || !kbConfig.worker.enabled) {
    console.log("[KB WORKER] Disabled");
    return;
  }
  if (timer) return;
  console.log(`[KB WORKER] Started (${workerId})`);
  void poll();
  timer = setInterval(() => void poll(), kbConfig.worker.interval);
  timer.unref?.();
};

export const stopKnowledgeBaseWorker = () => {
  if (timer) clearInterval(timer);
  timer = null;
};
