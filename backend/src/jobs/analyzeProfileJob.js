// src/queues/analyzeQueue.js
import { Queue } from "bullmq";
import IORedis from "ioredis";
import Profile from "../models/Profile.js";

const connection = new IORedis({ maxRetriesPerRequest: null });

export const analyzeProfileQueue = new Queue("analyzeProfile", {
  connection,
  defaultJobOptions: {
    attempts: 3,                  // retry up to 3 times on failure
    backoff: {
      type:  "exponential",       // wait 2s → 4s → 8s between retries
      delay: 2000
    },
    removeOnComplete: 50,         // keep last 50 completed in Redis
    removeOnFail:     20,         // keep last 20 failed for debugging
  }
});

// ─────────────────────────────────────────────────────
// Priority levels — lower number = processed first
// ─────────────────────────────────────────────────────
export const PRIORITY = {
  EDU_VERIFIED: 1,   // IIT/NIT verified students → front of queue
  PRO:          2,   // paid users → next
  RETURNING:    3,   // user has been analyzed before → faster requeue
  NEW:          5,   // first time users → normal
  GUEST:        8,   // not logged in / anonymous → last
};

// ─────────────────────────────────────────────────────
// Main enqueue function — call this from analyzeRoutes.js
// ─────────────────────────────────────────────────────
export async function enqueueAnalysis(profile, jobData) {
  // Determine priority from profile fields
  const priority = resolvePriority(profile);

  // jobId prevents duplicate jobs for same user
  // If same user triggers analyze twice, second one is ignored
  const jobId = `analyze-${profile.githubId}`;

  // Check if job already queued or running
  const existing = await analyzeProfileQueue.getJob(jobId);
  if (existing) {
    const state = await existing.getState();
    if (state === "active" || state === "waiting" || state === "delayed") {
      return {
        queued:   false,
        reason:   "already_queued",
        state,
        priority,
        message:  "Analysis already in progress."
      };
    }
    // If it failed or completed — remove it so we can requeue
    await existing.remove();
  }

  const job = await analyzeProfileQueue.add(
    "analyzeProfile",
    jobData,
    {
      jobId,
      priority,
      attempts: 3,
      backoff: {
        type:  "exponential",
        delay: 2000
      },
      removeOnComplete: 50,
      removeOnFail:     20,
    }
  );

  console.log(`Job ${job.id} queued with priority ${priority} for ${profile.username}`);

  return {
    queued:   true,
    jobId:    job.id,
    priority,
    label:    priorityLabel(priority),
    message:  "Analysis queued successfully."
  };
}

// ─────────────────────────────────────────────────────
// Priority resolver — reads profile fields
// ─────────────────────────────────────────────────────
function resolvePriority(profile) {
  if (profile.edu_verified)    return PRIORITY.EDU_VERIFIED;
  if (profile.isPro)           return PRIORITY.PRO;
  if (profile.updatedAt)  return PRIORITY.RETURNING;
  return PRIORITY.NEW;
}

// Human readable label for API response
function priorityLabel(priority) {
  const labels = {
    [PRIORITY.EDU_VERIFIED]: "University verified — priority queue",
    [PRIORITY.PRO]:          "Pro user — priority queue",
    [PRIORITY.RETURNING]:    "Returning user — standard queue",
    [PRIORITY.NEW]:          "New user — standard queue",
    [PRIORITY.GUEST]:        "Guest — low priority queue",
  };
  return labels[priority] ?? "Standard queue";
}