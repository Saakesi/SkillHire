import { createWorker } from "../redisClient.js";
import axios from "axios";
import Profile from "../models/Profile.js";

const processor = async (job) => {
  const { githubId, accessToken } = job.data;

  try {
    // Fetch all repos
    const res = await axios.get("https://api.github.com/user/repos", {
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    const repos = res.data.map((r) => ({
      name: r.name,
      private: r.private,
      html_url: r.html_url
    }));

    // Save repos in profile (can be stored as array or in separate collection)
    await Profile.findOneAndUpdate(
      { githubId },
      { $set: { repos } },
      { new: true }
    );

    console.log(`Fetched repos for user ${githubId}`);
  } catch (err) {
    console.error("Error fetching repos for user:", githubId, err);
  }
};

export const fetchReposWorker = createWorker("fetch-repos", processor);
