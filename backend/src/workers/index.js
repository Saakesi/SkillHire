import dotenv from "dotenv";
dotenv.config(); // ✅ REQUIRED
import { connectDB } from "../connectDB.js";

const startWorkers = async () => {
  await connectDB();

  await import("./fetchReposWorker.js");
  await import("./analyzeWorker.js");

  console.log("🚀 Workers started");
};

startWorkers();
