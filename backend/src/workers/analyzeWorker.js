import { Worker } from "bullmq";
import Profile from "../models/Profile.js";
import Analysis from "../models/Analysis.js";
import { extractSkills } from "../services/scoring/skillExtractor.js";
import { connection } from "../redisClient.js";
import { analyzeRepos } from "../services/scoring/analyzeRepos.js";

console.log("🟢 analyzeProfileWorker file loaded");
export const analyzeProfileWorker = new Worker(
  "analyze-profile",
  async (job) => {
    console.log("🟡 analyze-profile job received:", job.data);
    const { githubId } = job.data;

    const profile = await Profile.findOne({ githubId }).lean();

    console.log("🟠 profile found:", !!profile);
console.log("🟠 repos field:", profile?.repos);
console.log("🟠 repos type:", typeof profile?.repos);
console.log("🟠 isArray:", Array.isArray(profile?.repos));

if (profile?.repos?.length > 0) {
  console.log("🟢 first repo:");
  console.log(JSON.stringify(profile.repos[0], null, 2));
}

    // ✅ HARD GUARDS
    if (!profile) {
      throw new Error("Profile not found");
    }

    if (!Array.isArray(profile.repos) || profile.repos.length === 0) {
      throw new Error("Repos not ready for analysis");
    }
    
    console.log(JSON.stringify(profile.repos[0], null, 2));

    //const skills = extractSkills(profile.repos);
    const skills = analyzeRepos(profile.repos);
    await Analysis.findOneAndUpdate(
      { githubId },
      {
        status: "completed",
        result: {
          skills,
          repoCount: profile.repos.length,
          analyzedAt: new Date()
        },
        updatedAt: new Date()
      },
      { upsert: true }
    );

    console.log(`✅ Analysis completed for ${githubId}`);
  },
  { connection }
);



