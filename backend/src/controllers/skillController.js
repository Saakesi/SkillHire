import Skill from "../models/Skill.js";
import Profile from "../models/Profile.js";
import { getUserFromCookie } from "../utils/getUserFromCookie.js";

// GET all skills for a user
export const getSkills = async (req, res) => {
  const { username } = req.params;
  try {
    const profile = await Profile.findOne({ username });
    if (!profile) return res.status(404).json({ error: "Profile not found" });

    const skills = await Skill.find({ profileId: profile._id });
    res.json({ skills, overallScore: skills.reduce((sum, s) => sum + s.score, 0) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

// Update / add skill manually
export const updateSkill = async (req, res) => {
  const user = getUserFromCookie(req);
  if (!user) return res.status(401).json({ error: "Not logged in" });

  const { name, confidence, score } = req.body;

  try {
    let skill = await Skill.findOne({ profileId: user._id, name });
    if (!skill) {
      skill = await Skill.create({ profileId: user._id, name, confidence, score });
    } else {
      skill.confidence = confidence ?? skill.confidence;
      skill.score = score ?? skill.score;
      skill.updatedAt = new Date();
      await skill.save();
    }

    res.json(skill);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};
