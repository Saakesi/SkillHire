import jwt from "jsonwebtoken";
import Profile from "../models/Profile.js";
import { extractAuthToken } from "../utils/authToken.js";
import { matchCandidatesForJD } from "../services/jdMatcher.js";
import { extractTextFromJdFile } from "../services/jdFileExtractor.js";

const getRecruiter = async (req) => {
  const token = extractAuthToken(req);
  if (!token) return null;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== "recruiter") return null;
    return await Profile.findById(decoded.profileId);
  } catch {
    return null;
  }
};

export const matchCandidatesByJD = async (req, res) => {
  try {
    const recruiter = await getRecruiter(req);
    if (!recruiter) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const typedJdText = String(req.body?.jdText || "").trim();
    const limit = Math.min(Math.max(Number(req.body?.limit || 100), 1), 500);

    let fileJdText = "";
    if (req.file) {
      try {
        fileJdText = await extractTextFromJdFile(req.file);
        console.log("JD controller file extracted text length:", fileJdText.length);
        console.log("JD controller file extracted text preview:", fileJdText.slice(0, 1200));
      } catch (err) {
        console.error("JD controller file extract error:", err);
        return res.status(400).json({ error: err.message || "Invalid JD file" });
      }
    }

    if (typedJdText) {
      console.log("JD controller typed text length:", typedJdText.length);
      console.log("JD controller typed text preview:", typedJdText.slice(0, 1200));
    }

    const jdText = [typedJdText, fileJdText].filter(Boolean).join("\n\n").trim();
    console.log("JD controller combined text length:", jdText.length);
    console.log("JD controller combined text preview:", jdText.slice(0, 2000));

    if (!jdText) {
      return res.status(400).json({ error: "Provide JD text or upload a JD file." });
    }

    const { parsedJD, searchableJD, results } = await matchCandidatesForJD(jdText, { limit });

    return res.json({
      parsedJD,
      searchableJD,
      count: results.length,
      results
    });
  } catch (err) {
    console.error("matchCandidatesByJD error:", err);
    return res.status(500).json({ error: "Failed to match candidates" });
  }
};
