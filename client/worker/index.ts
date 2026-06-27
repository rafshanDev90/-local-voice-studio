import { Worker, Queue, QueueEvents } from "bullmq";

const REDIS_URL = process.env.REDIS_URL ?? "redis://localhost:6379";

const url = new URL(REDIS_URL);
const connection = {
  host: url.hostname,
  port: Number(url.port) || 6379,
  password: url.password || undefined,
  maxRetriesPerRequest: null,
};

export const generationQueue = new Queue("voice-generation", { connection });

export const queueEvents = new QueueEvents("voice-generation", { connection });

export interface GenerationJob {
  text: string;
  voice: string;
  speed: number;
  languageCode: string | null;
  userId: string | null;
  service: string;
}

const worker = new Worker<GenerationJob>(
  "voice-generation",
  async (job) => {
    const { text, voice, speed, languageCode } = job.data;
    const params = new URLSearchParams({ voice, speed: String(speed) });
    if (languageCode) params.set("language_code", languageCode);
    params.set("user_id", job.data.userId ?? "anonymous");
    params.set("service", job.data.service);
    const backend =
      process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
    const res = await fetch(`${backend}/api/generate?${params}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
    if (!res.ok) {
      throw new Error(`Generation failed: ${res.status} ${res.statusText}`);
    }
    const historyId = res.headers.get("X-History-Id");
    return { historyId, status: "completed" };
  },
  { connection, concurrency: 2 },
);

worker.on("completed", (job) => {
  console.log(`Job ${job.id} completed`);
});

worker.on("failed", (job, err) => {
  console.error(`Job ${job?.id} failed:`, err);
});

export async function enqueueGeneration(
  data: GenerationJob,
): Promise<string> {
  const job = await generationQueue.add("generate", data, {
    attempts: 3,
    backoff: { type: "exponential", delay: 2000 },
  });
  return job.id ?? "";
}

export async function getJobResult(
  jobId: string,
): Promise<{ historyId?: string; status: string } | null> {
  const job = await generationQueue.getJob(jobId);
  if (!job) return null;
  if (await job.isFailed()) return { status: "failed" };
  if (await job.isCompleted()) {
    const returnValue = job.returnvalue as { historyId?: string; status: string };
    return returnValue;
  }
  return { status: "waiting" };
}

console.log("BullMQ worker started. Waiting for jobs...");
