import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { FileText, Loader2, Search, Sparkles, Target } from "lucide-react";
import {
  SiAngular,
  SiCplusplus,
  SiCss,
  SiHtml5,
  SiJavascript,
  SiOpenjdk,
  SiMysql,
  SiPython,
  SiReact,
  SiTypescript,
  SiVuedotjs
} from "react-icons/si";
import { jdService } from "../../services/jdService";

const sectionCard = "rounded-xl border border-border bg-card p-4";

const LOGO_MAP = {
  react: SiReact,
  angular: SiAngular,
  "vue.js": SiVuedotjs,
  javascript: SiJavascript,
  typescript: SiTypescript,
  java: SiOpenjdk ,
  python: SiPython,
  cplusplus: SiCplusplus,
  "c++": SiCplusplus,
  html: SiHtml5,
  css: SiCss,
  sql: SiMysql
};

const LABEL_MAP = {
  react: "React",
  angular: "Angular",
  "vue.js": "Vue.js",
  javascript: "JavaScript",
  typescript: "TypeScript",
  java: "Java",
  python: "Python",
  "c++": "C++",
  cpp: "C++",
  html: "HTML",
  css: "CSS",
  sql: "SQL"
};

const toLabel = (value) => {
  const normalized = String(value || "").trim().toLowerCase();
  if (!normalized) return "";

  if (LABEL_MAP[normalized]) return LABEL_MAP[normalized];

  return normalized
    .split(" ")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

const toLogoKey = (value) => String(value || "").trim().toLowerCase();

const ChipList = ({ items, emptyLabel }) => (
  <div className="flex flex-wrap gap-2">
    {items?.length ? items.map((item, index) => {
      const Logo = LOGO_MAP[toLogoKey(item)];
      return (
      <span key={`${item}-${index}`} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs bg-secondary text-secondary-foreground border border-border">
        {Logo ? <Logo className="w-3.5 h-3.5" /> : null}
        <span>{toLabel(item)}</span>
      </span>
      );
    }) : (
      <span className="text-sm text-muted-foreground">{emptyLabel}</span>
    )}
  </div>
);

export default function JdMatchTab() {
  const [jdText, setJdText] = useState("");
  const [jdFile, setJdFile] = useState(null);
  const [limit, setLimit] = useState(50);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [parsedJD, setParsedJD] = useState(null);
  const [searchableJD, setSearchableJD] = useState(null);
  const [matches, setMatches] = useState([]);

  const handleMatch = async (e) => {
    e.preventDefault();
    const text = jdText.trim();
    if (!text && !jdFile) {
      setError("Paste a job description or upload a JD file.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const data = await jdService.matchCandidates({ jdText: text, jdFile, limit });
      setParsedJD(data.parsedJD || null);
      setSearchableJD(data.searchableJD || null);
      setMatches(data.results || []);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to match candidates.");
      setParsedJD(null);
      setSearchableJD(null);
      setMatches([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      key="jd-match"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="space-y-5"
    >
      <div className="grid grid-cols-1 xl:grid-cols-[1.1fr_0.9fr] gap-5 items-start">
        <form onSubmit={handleMatch} className={`${sectionCard} space-y-4`}>
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-primary" />
            <h3 className="font-semibold text-base">JD Matching</h3>
          </div>

          <p className="text-sm text-muted-foreground">
            Paste a job description or upload a JD file (PDF/DOCX/TXT), then rank candidates using extracted requirements.
          </p>

          <textarea
            value={jdText}
            onChange={(e) => setJdText(e.target.value)}
            rows={16}
            placeholder="Paste the job description here (optional if file is uploaded)..."
            className="w-full rounded-xl border border-border bg-background p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-y"
          />

          <div className="space-y-2">
            <label className="block text-sm text-muted-foreground">Upload JD file (optional)</label>
            <input
              type="file"
              accept=".pdf,.docx,.txt,.md"
              onChange={(e) => setJdFile(e.target.files?.[0] || null)}
              className="block w-full text-sm text-foreground file:mr-3 file:rounded-lg file:border file:border-border file:bg-primary/15 file:px-3 file:py-2 file:text-sm file:font-medium file:text-foreground hover:file:bg-primary/25"
            />
            {jdFile && (
              <p className="text-xs text-muted-foreground">
                Selected: <span className="text-foreground">{jdFile.name}</span>
              </p>
            )}
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <label className="flex items-center gap-2 text-sm text-muted-foreground">
              Match limit
              <input
                type="number"
                min="1"
                max="500"
                value={limit}
                onChange={(e) => setLimit(Number(e.target.value) || 50)}
                className="w-24 rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </label>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              Match Candidates
            </button>
          </div>

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}
        </form>

        <div className="space-y-4">
          <div className={`${sectionCard} space-y-3`}>
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary" />
              <h3 className="font-semibold text-base">Extracted Requirements</h3>
            </div>

            {parsedJD ? (
              <div className="space-y-4">
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Skills</p>
                  <ChipList items={parsedJD.skills} emptyLabel="No skills extracted" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Frameworks</p>
                  <ChipList items={parsedJD.frameworks} emptyLabel="No frameworks extracted" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Languages</p>
                  <ChipList items={parsedJD.languages} emptyLabel="No languages extracted" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Keywords</p>
                  <ChipList items={parsedJD.keywords} emptyLabel="No keywords extracted" />
                </div>

                <div className="pt-2 border-t border-border space-y-3">
                  <div className="flex items-center gap-2">
                    <Search className="w-4 h-4 text-primary" />
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Terms Used For Scoring</p>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Skills/frameworks/keywords are scored only when measurable from GitHub or LeetCode-derived profile fields. Languages are treated as strict JD requirements.
                  </p>

                  <div>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Skills</p>
                    <ChipList items={searchableJD?.skills} emptyLabel="No measurable skills" />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Frameworks</p>
                    <ChipList items={searchableJD?.frameworks} emptyLabel="No measurable frameworks" />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Languages</p>
                    <ChipList items={searchableJD?.languages} emptyLabel="No measurable languages" />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Keywords</p>
                    <ChipList items={searchableJD?.keywords} emptyLabel="No measurable keywords" />
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Run a match to see structured requirements here.</p>
            )}
          </div>

          <div className={`${sectionCard} space-y-3`}>
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-primary" />
              <h3 className="font-semibold text-base">How It Works</h3>
            </div>
            <ul className="space-y-2 text-sm text-muted-foreground list-disc pl-5">
              <li>AI extracts technical requirements from the JD.</li>
              <li>The backend ranks candidates deterministically from existing analysis fields.</li>
              <li>Matched and missing features are returned for quick review.</li>
            </ul>
          </div>
        </div>
      </div>

      <div className={`${sectionCard} space-y-4`}>
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h3 className="font-semibold text-base">Ranked Candidates</h3>
            <p className="text-sm text-muted-foreground">Sorted by blended JD fit, with overall strength used as part of the ranking.</p>
          </div>
          <span className="text-sm text-muted-foreground">
            {matches.length} result{matches.length === 1 ? "" : "s"}
          </span>
        </div>

        {matches.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border px-4 py-10 text-center text-sm text-muted-foreground">
            No matches yet. Paste a JD or upload a file and run the matcher.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {matches.map((candidate) => (
              <div key={candidate.userId} className="rounded-xl border border-border bg-background p-4 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <img
                      src={`https://avatars.githubusercontent.com/u/${candidate.userId}?v=4`}
                      alt={`${candidate.username || `User ${candidate.userId}`} avatar`}
                      className="w-10 h-10 rounded-full border border-border object-cover bg-muted"
                      loading="lazy"
                    />
                    <div className="min-w-0">
                      <p className="font-semibold text-sm truncate">{candidate.username || `User ${candidate.userId}`}</p>
                      <p className="text-xs text-muted-foreground">User ID: {candidate.userId}</p>
                    </div>
                  </div>
                  <span className="rounded-lg border border-primary/30 bg-primary/10 px-2.5 py-1 text-sm font-bold text-primary">
                    {candidate.finalScore?.toFixed(2)}%
                  </span>
                </div>

                <div className="flex items-center gap-3 flex-wrap">
                  {candidate.username && (
                    <Link to={`/profile/${candidate.username}`} target="_blank" className="text-xs text-primary hover:underline">
                      View profile
                    </Link>
                  )}
                  {candidate.leetcodeUsername && (
                    <a
                      href={`https://leetcode.com/u/${candidate.leetcodeUsername}/`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-primary hover:underline"
                    >
                      LeetCode profile
                    </a>
                  )}
                </div>

                <div className="space-y-2">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Matched</p>
                    <ChipList items={candidate.matchedFeatures} emptyLabel="None" />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Missing</p>
                    <ChipList items={candidate.missingFeatures} emptyLabel="None" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
