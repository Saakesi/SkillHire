// src/workers/workerLauncher.js
import { fork } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const WORKER_COUNT = 3; // spawn 3 separate worker processes

for (let i = 0; i < WORKER_COUNT; i++) {
  const worker = fork(path.join(__dirname, "analyzeWorker.js"), [], {
    env: { ...process.env, WORKER_ID: i + 1 }
  });

  worker.on("exit", (code) => {
    console.error(`Worker ${i + 1} died (code ${code}). Restarting...`);
    // Auto-restart crashed workers
    fork(path.join(__dirname, "analyzeWorker.js"));
  });

  console.log(`Worker ${i + 1} spawned`);
}