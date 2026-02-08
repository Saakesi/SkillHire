import { LANGUAGE_SKILL_MAP } from "../../utils/languageSkillMap.js";
import { SKILL_KEYWORDS } from "../../utils/skillKeywords.js";
import { filterValidRepos } from "../antiGaming/repoFilter.js";

export function extractSkills(repos) {
  const skills = new Map();

  for (const repo of repos) {
    if (!repo) continue;

    // ✅ Language
    if (typeof repo.language === "string") {
      skills.set(repo.language, (skills.get(repo.language) || 0) + 1);
    }

    // ✅ Topics
    if (Array.isArray(repo.topics)) {
      for (const topic of repo.topics) {
        if (!topic) continue;
        skills.set(topic, (skills.get(topic) || 0) + 1);
      }
    }

    // ✅ Files
    if (Array.isArray(repo.files)) {
      for (const file of repo.files) {
        if (!file?.name) continue;

        const ext = file.name.split(".").pop();
        if (ext) {
          skills.set(ext, (skills.get(ext) || 0) + 1);
        }
      }
    }
    console.log("🧪 extractSkills repos count:", repos.length);
  console.log("🧪 sample repo keys:", Object.keys(repos[0] || {}));

    // ✅ Readme text
    if (typeof repo.readme === "string" && repo.readme.length > 0) {
      if (repo.readme.toLowerCase().includes("docker")) {
        skills.set("docker", (skills.get("docker") || 0) + 1);
      }
    }
  }

  return [...skills.entries()]
    .map(([name, score]) => ({ name, score }))
    .sort((a, b) => b.score - a.score);
}
