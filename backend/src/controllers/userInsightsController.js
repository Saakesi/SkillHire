import mongoose from "mongoose";
import Profile from "../models/Profile.js";
import Analysis from "../models/Analysis.js";
import { generateDeveloperInsights } from "../services/insightEngine.js";

const findProfileByIdParam = async (idParam) => {
    const trimmed = String(idParam || "").trim();
    if (!trimmed) return null;

    if (mongoose.Types.ObjectId.isValid(trimmed)) {
        const byObjectId = await Profile.findById(trimmed).lean();
        if (byObjectId) return byObjectId;
    }

    const asNumber = Number(trimmed);
    if (Number.isFinite(asNumber)) {
        const byGithubId = await Profile.findOne({ githubId: asNumber }).lean();
        if (byGithubId) return byGithubId;
    }

    return await Profile.findOne({ username: trimmed }).lean();
};

export const getUserInsights = async (req, res) => {
    try {
        const profile = await findProfileByIdParam(req.params.id);
        if (!profile) {
            return res.status(404).json({ error: "User not found" });
        }

        const analysis = await Analysis.findOne({ githubId: profile.githubId, status: "completed" })
            .select("githubId username rawMetrics leetcodeMetrics leetcodeScore scoreBreakdown.normalizedScores updatedAt")
            .lean();

        if (!analysis) {
            return res.status(404).json({ error: "Completed analysis not found" });
        }

        const insightPayload = await generateDeveloperInsights(analysis);

        return res.json({
            userId: profile._id,
            githubId: profile.githubId,
            username: profile.username,
            updatedAt: analysis.updatedAt,
            ...insightPayload
        });
    } catch (err) {
        console.error("getUserInsights error:", err);
        return res.status(500).json({ error: "Failed to generate insights" });
    }
};
