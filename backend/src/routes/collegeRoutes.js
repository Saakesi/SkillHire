import express from "express";
import College from "../models/College.js";

const router = express.Router();

function expandQuery(query) {
  query = query.toLowerCase();
  const expansions = [query];

  if (query.includes("iit")) {
    expansions.push(query.replace("iit", "indian institute of technology"));
  }

  if (query.includes("nit")) {
    expansions.push(query.replace("nit", "national institute of technology"));
  }

  if (query.includes("iiit")) {
    expansions.push(
      query.replace("iiit", "indian institute of information technology")
    );
  }

  return expansions;
}

function normalizeCollege(name, country = "Unknown") {
  const cleanName = name.replace(/,/g, "").trim();

  const id = (cleanName + "-" + country)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-");

  return {
    id,
    name: cleanName,
    country
  };
}

router.get("/", async (req, res) => {
  try {
    const query = req.query.search?.toLowerCase();
    if (!query) return res.json([]);

    const queries = expandQuery(query);

    // 🔥 1. SEARCH IN DB
    let colleges = await College.find({
      $or: queries.flatMap(q => [
        { name: { $regex: q, $options: "i" } },
        { aliases: { $elemMatch: { $regex: q, $options: "i" } } }
      ])
    }).limit(10);

    if (colleges.length > 0) {
      return res.json(colleges);
    }

    // 🔥 2. SEARCH IN UNIVERSITIES API
    let results = [];

    for (const q of queries) {
      try {
        const response = await fetch(
          `http://universities.hipolabs.com/search?name=${q}`
        );
        const data = await response.json();
        results = [...results, ...data];
      } catch (err) {
        console.error("API error:", err);
      }
    }

    // remove duplicates
    const unique = [];
    const seen = new Set();

    for (const uni of results) {
      const normalized = normalizeCollege(uni.name, uni.country);

      if (!seen.has(normalized.id)) {
        seen.add(normalized.id);

        // save in DB for future
        let existing = await College.findOne({ id: normalized.id });

        if (!existing) {
          existing = await College.create({
            ...normalized,
            aliases: []
          });
        }

        unique.push(existing);
      }

      if (unique.length >= 10) break;
    }

    if (unique.length > 0) {
      return res.json(unique);
    }

    // 🔥 3. FINAL FALLBACK → MANUAL ENTRY
    const manual = normalizeCollege(query, "Unknown");

    return res.json([
      {
        ...manual,
        manual: true // 🔥 flag for frontend
      }
    ]);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;