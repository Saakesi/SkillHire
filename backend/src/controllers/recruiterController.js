import jwt from "jsonwebtoken";
import Analysis from "../models/Analysis.js";
import Profile from "../models/Profile.js";

// ── helper: get authenticated recruiter profile ───────────────────────────────
const getRecruiter = async (req) => {
  const token = req.cookies.auth;
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== "recruiter") return null;
    return await Profile.findById(decoded.profileId);
  } catch {
    return null;
  }
};

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");


export const searchDevelopers = async (req, res) => {
  try {
    const recruiter = await getRecruiter(req);
    if (!recruiter) return res.status(401).json({ error: "Not authenticated" });

    const {
      q = "",
      skills = "",
      developerType = "",
      minScore = 0,
      maxScore = 100,
      college = "",
      branch = "",
      batch = "",
      sortBy = "score",
      page = 1,
      limit = 20,
    } = req.query;

    const skip = (Number(page) - 1) * Number(limit);

    const analysisMatch = { status: "completed" };
    analysisMatch.overallScore = { $gte: Number(minScore), $lte: Number(maxScore) };
    if (developerType) analysisMatch["rawMetrics.developerType"] = developerType;

    // Multi-field skill search — each skill must appear in at least one field
    if (skills) {
      const skillList = skills.split(",").map(s => s.trim()).filter(Boolean);
      if (skillList.length) {
        analysisMatch.$and = skillList.map(skill => {
          const re = new RegExp(escapeRegex(skill), "i");
          return {
            $or: [
              { "rawMetrics.skills": re },
              { "rawMetrics.frameworks": re },
              { "leetcodeMetrics.languages": { $elemMatch: { languageName: re } } },
              { "leetcodeMetrics.algorithms.advanced": { $elemMatch: { tagName: re } } },
              { "leetcodeMetrics.algorithms.intermediate": { $elemMatch: { tagName: re } } },
              { "leetcodeMetrics.algorithms.fundamental": { $elemMatch: { tagName: re } } },
            ],
          };
        });
      }
    }

    // q searches username OR any skill field
    const qRe = q ? escapeRegex(q) : null;
    const qMatch = qRe ? {
      $or: [
        { "profile.username": { $regex: qRe, $options: "i" } },
        { "rawMetrics.skills": { $regex: qRe, $options: "i" } },
        { "rawMetrics.frameworks": { $regex: qRe, $options: "i" } },
        { "rawMetrics.primaryLanguage": { $regex: qRe, $options: "i" } },
        { "leetcodeMetrics.languages": { $elemMatch: { languageName: { $regex: qRe, $options: "i" } } } },
        { "leetcodeMetrics.algorithms.advanced": { $elemMatch: { tagName: { $regex: qRe, $options: "i" } } } },
        { "leetcodeMetrics.algorithms.intermediate": { $elemMatch: { tagName: { $regex: qRe, $options: "i" } } } },
        { "leetcodeMetrics.algorithms.fundamental": { $elemMatch: { tagName: { $regex: qRe, $options: "i" } } } },
      ],
    } : null;

    const profileMatch = {};
    if (college) profileMatch["profile.college.name"] = { $regex: escapeRegex(college), $options: "i" };
    if (branch) profileMatch["profile.branch"] = { $regex: escapeRegex(branch), $options: "i" };
    if (batch) profileMatch["profile.graduationYear"] = Number(batch);

    const sortField =
      sortBy === "recent" ? { updatedAt: -1 }
        : sortBy === "stars" ? { "rawMetrics.totalStars": -1 }
          : { overallScore: -1 };

    const pipeline = [
      { $match: analysisMatch },
      {
        $lookup: {
          from: "profiles",
          localField: "githubId",
          foreignField: "githubId",
          as: "profile",
        },
      },
      { $unwind: { path: "$profile", preserveNullAndEmptyArrays: true } },
      { $match: { "profile.accountType": { $ne: "recruiter" } } },
      ...(Object.keys(profileMatch).length ? [{ $match: profileMatch }] : []),
      ...(qMatch ? [{ $match: qMatch }] : []),
      { $sort: sortField },
      {
        $facet: {
          total: [{ $count: "count" }],
          results: [
            { $skip: skip },
            { $limit: Number(limit) },
            {
              $project: {
                _id: 0,
                githubId: 1,
                overallScore: 1,
                leetcodeScore: 1,
                badges: 1,
                updatedAt: 1,
                developerType: "$rawMetrics.developerType",
                primaryLanguage: "$rawMetrics.primaryLanguage",
                skills: { $slice: ["$rawMetrics.skills", 8] },
                totalStars: "$rawMetrics.totalStars",
                repoCount: "$rawMetrics.repoCount",
                username: "$profile.username",
                avatarUrl: "$profile.avatarUrl",
                college: "$profile.college.name",
                branch: "$profile.branch",
                graduationYear: "$profile.graduationYear",
              },
            },
          ],
        },
      },
    ];

    const [raw] = await Analysis.aggregate(pipeline);
    const total = raw?.total?.[0]?.count || 0;
    const results = raw?.results || [];

    return res.json({ total, page: Number(page), pages: Math.ceil(total / Number(limit)), results });
  } catch (err) {
    console.error("searchDevelopers error:", err);
    res.status(500).json({ error: "Search failed" });
  }
};


export const getStats = async (req, res) => {
  try {
    const recruiter = await getRecruiter(req);
    if (!recruiter) return res.status(401).json({ error: "Not authenticated" });

    const [agg] = await Analysis.aggregate([
      { $match: { status: "completed" } },
      {
        $group: {
          _id: null,
          totalDevelopers: { $sum: 1 },
          avgScore: { $avg: "$overallScore" },
          maxScore: { $max: "$overallScore" },
        },
      },
    ]);

    const recentlyAnalyzed = await Analysis.countDocuments({
      status: "completed",
      updatedAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
    });

    return res.json({
      totalDevelopers: agg?.totalDevelopers || 0,
      avgScore: agg ? Math.round(agg.avgScore) : 0,
      maxScore: agg?.maxScore || 0,
      recentlyAnalyzed,
      shortlistCount: recruiter.shortlists?.length || 0,
    });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};


export const createShortlist = async (req, res) => {
  try {
    const recruiter = await getRecruiter(req);
    if (!recruiter) return res.status(401).json({ error: "Not authenticated" });

    const { name, description = "" } = req.body;
    if (!name) return res.status(400).json({ error: "Name is required" });

    if (!recruiter.shortlists) recruiter.shortlists = [];
    recruiter.shortlists.push({ name, description, developers: [] });
    await recruiter.save();

    const created = recruiter.shortlists[recruiter.shortlists.length - 1];
    return res.status(201).json(created);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};


export const getShortlists = async (req, res) => {
  try {
    const recruiter = await getRecruiter(req);
    if (!recruiter) return res.status(401).json({ error: "Not authenticated" });

    const allGithubIds = [...new Set((recruiter.shortlists || []).flatMap(s => s.developers))];

    const analyses = await Analysis.aggregate([
      { $match: { githubId: { $in: allGithubIds }, status: "completed" } },
      {
        $lookup: {
          from: "profiles",
          localField: "githubId",
          foreignField: "githubId",
          as: "profile",
        },
      },
      { $unwind: { path: "$profile", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 0,
          githubId: 1,
          overallScore: 1,
          developerType: "$rawMetrics.developerType",
          primaryLanguage: "$rawMetrics.primaryLanguage",
          skills: { $slice: ["$rawMetrics.skills", 5] },
          username: "$profile.username",
          avatarUrl: "$profile.avatarUrl",
        },
      },
    ]);

    const devMap = Object.fromEntries(analyses.map(a => [a.githubId, a]));

    const enriched = (recruiter.shortlists || []).map(s => ({
      _id: s._id,
      name: s.name,
      description: s.description,
      createdAt: s.createdAt,
      developers: s.developers.map(id => devMap[id]).filter(Boolean),
    }));

    return res.json(enriched);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};


export const addToShortlist = async (req, res) => {
  try {
    const recruiter = await getRecruiter(req);
    if (!recruiter) return res.status(401).json({ error: "Not authenticated" });

    const { id } = req.params;
    const { githubId } = req.body;
    if (!githubId) return res.status(400).json({ error: "githubId required" });

    const list = recruiter.shortlists?.id(id);
    if (!list) return res.status(404).json({ error: "Shortlist not found" });

    if (!list.developers.includes(Number(githubId))) {
      list.developers.push(Number(githubId));
      await recruiter.save();
    }

    return res.json({ message: "Added", count: list.developers.length });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};


export const removeFromShortlist = async (req, res) => {
  try {
    const recruiter = await getRecruiter(req);
    if (!recruiter) return res.status(401).json({ error: "Not authenticated" });

    const { id, githubId } = req.params;
    const list = recruiter.shortlists?.id(id);
    if (!list) return res.status(404).json({ error: "Shortlist not found" });

    list.developers = list.developers.filter(d => d !== Number(githubId));
    await recruiter.save();

    return res.json({ message: "Removed", count: list.developers.length });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};


export const deleteShortlist = async (req, res) => {
  try {
    const recruiter = await getRecruiter(req);
    if (!recruiter) return res.status(401).json({ error: "Not authenticated" });

    recruiter.shortlists?.pull({ _id: req.params.id });
    await recruiter.save();
    return res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};
