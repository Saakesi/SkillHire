import Repo from "../models/Repo.js";
import Profile from "../models/Profile.js";
import { fetchReposQueue } from "../jobs/fetchReposJob.js";
import { getUserFromCookie } from "../utils/getUserFromCookie.js";

// GET recent 5-10 repos
export const getRecentRepos = async (req, res) => {
  const { username } = req.params;
  try {
    const profile = await Profile.findOne({ username });
    if (!profile) return res.status(404).json({ error: "Profile not found" });

    const repos = await Repo.find({ profileId: profile._id })
                            .sort({ updatedAt: -1 })
                            .limit(10);
    res.json(repos);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

// Trigger re-analysis of a single repo
export const analyzeSingleRepo = async (req, res) => {
  const user = getUserFromCookie(req);
  if (!user) return res.status(401).json({ error: "Not logged in" });

  const { repoId } = req.params;

  try {
    const repo = await Repo.findById(repoId);
    if (!repo) return res.status(404).json({ error: "Repo not found" });

    // enqueue fetch/re-analysis
    await fetchReposQueue.add("fetchRepo", {
      githubUsername: user.username,
      profileId: user._id,
      githubToken: user.githubToken, // optional
      repoId
    });

    res.json({ message: "Repo analysis queued" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to queue repo analysis" });
  }
};
