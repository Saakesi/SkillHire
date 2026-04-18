export const API_BASE_URL = import.meta.env.VITE_API_URL;

export const LANGUAGE_COLORS = {
  javascript: "#f7df1e",
  typescript: "#3178c6",
  python: "#3776ab",
  java: "#f89820",
  go: "#00ADD8",
  rust: "#dea584",
  c: "#A8B9CC",
  "c++": "#00599C",
  cpp: "#00599C",
  "c#": "#239120",
  csharp: "#239120",
  php: "#777BB4",
  ruby: "#CC342D",
  swift: "#FA7343",
  kotlin: "#7F52FF",
  dart: "#0175C2",
  shell: "#89e051",
  html: "#e34c26",
  css: "#264de4",
  r: "#276DC3",
  scala: "#DC322F",
  elixir: "#6E4A7E"
};

export const TECH_ICONS = {
  javascript: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg",
  typescript: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg",
  python: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg",
  java: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/java/java-original.svg",
  cpp: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/cplusplus/cplusplus-original.svg",
  c: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/c/c-original.svg",
  csharp: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/csharp/csharp-original.svg",
  swift: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/swift/swift-original.svg",
  kotlin: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/kotlin/kotlin-original.svg",
  ruby: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/ruby/ruby-original.svg",
  scala: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/scala/scala-original.svg",
  dart: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/dart/dart-original.svg",
  php: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/php/php-original.svg",
  react: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg",
  express: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/express/express-original.svg",
  html: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/html5/html5-original.svg",
  css: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/css3/css3-original.svg",
  vercel: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vercel/vercel-original.svg",
  aws: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/amazonwebservices/amazonwebservices-original-wordmark.svg",
  firebase: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/firebase/firebase-plain.svg",
  kubernetes: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/kubernetes/kubernetes-plain.svg",
  docker: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/docker/docker-original.svg",
  mongodb: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mongodb/mongodb-original.svg",
  postgresql: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postgresql/postgresql-original.svg",
  mysql: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mysql/mysql-original.svg",
  redis: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/redis/redis-original.svg",
  go: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/go/go-original-wordmark.svg",
  rust: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/rust/rust-plain.svg",
  nodejs: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg",
  nextjs: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nextjs/nextjs-original.svg",
  vuejs: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vuejs/vuejs-original.svg",
  angular: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/angularjs/angularjs-original.svg",
  django: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/django/django-plain.svg",
  flask: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/flask/flask-original.svg",
  nestjs: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nestjs/nestjs-plain.svg",
  graphql: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/graphql/graphql-plain.svg",
  bash: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/bash/bash-original.svg",
  lua: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/lua/lua-original.svg",
  r: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/r/r-original.svg"
};

export const SCORE_LABELS = {
  activityScore: "Activity",
  consistencyScore: "Consistency",
  collaborationScore: "Collaboration",
  codeReviewScore: "Code Review",
  projectQualityScore: "Project Quality",
  languageDiversityScore: "Lang Diversity",
  frameworkScore: "Frameworks",
  repoScore: "Repos",
  starScore: "Stars",
  forkScore: "Forks",
  streakScore: "Streak",
  issueScore: "Issues"
};

export const BADGE_DESCRIPTIONS = {
  polyglot: "Works across multiple programming languages and adapts quickly.",
  consistency: "Shows steady coding activity over time, not just short bursts.",
  collaborator: "Frequently contributes in collaborative workflows like PRs and reviews.",
  reviewer: "Actively reviews code and contributes useful review feedback.",
  quality_focused: "Maintains strong project quality signals like tests, CI, and docs.",
  open_source: "Has meaningful open-source style activity across repositories.",
  trending: "Strong current momentum in coding output and profile signals.",
  problem_solver: "Shows good problem-solving consistency, including LeetCode performance.",
  edu_verified: "College email or institutional profile has been verified."
};

export const BRANCH_OPTIONS = [
  "Computer Science Engineering",
  "Information Technology",
  "Electronics & Communication Engineering",
  "Electrical Engineering",
  "Mechanical Engineering",
  "Civil Engineering",
  "Chemical Engineering",
  "Biotechnology",
  "Data Science",
  "Artificial Intelligence & Machine Learning",
  "Cybersecurity",
  "Cloud Computing",
  "Internet of Things",
  "Other"
];

export const fadeUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4 }
};

export const diagnosisGridVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.05 }
  }
};

export const diagnosisCardVariants = {
  hidden: { opacity: 0, y: 12, scale: 0.99 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.35, ease: "easeOut" }
  }
};

export const SKILL_ICON_KEY = (name) => {
  const map = {
    "c++": "cpp",
    "c#": "csharp",
    python3: "python",
    python2: "python",
    golang: "go",
    "node.js": "nodejs",
    nodejs: "nodejs",
    "next.js": "nextjs",
    vue: "vuejs",
    "vue.js": "vuejs",
    angular: "angular",
    angularjs: "angular",
    nestjs: "nestjs",
    "nest.js": "nestjs"
  };
  const lower = String(name || "").toLowerCase();
  return map[lower] ?? lower;
};

export const formatBadgeLabel = (badge) =>
  String(badge || "")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

export const getBadgeDescription = (badge) => {
  const key = String(badge || "").toLowerCase().replace(/\s+/g, "_");
  if (BADGE_DESCRIPTIONS[key]) return BADGE_DESCRIPTIONS[key];
  if (key.includes("verified")) return "Profile verification badge based on trusted identity signals.";
  return "Awarded based on your combined GitHub, project quality, and coding activity signals.";
};

export const getDiagnosisPriority = (percentile) => {
  const value = Number(percentile || 0);
  if (value < 40) {
    return {
      label: "Critical focus",
      dotClass: "bg-red-500",
      textClass: "text-red-600 dark:text-red-400"
    };
  }
  if (value < 70) {
    return {
      label: "Moderate focus",
      dotClass: "bg-yellow-500",
      textClass: "text-yellow-600 dark:text-yellow-400"
    };
  }
  return {
    label: "Strong area",
    dotClass: "bg-green-500",
    textClass: "text-green-600 dark:text-green-400"
  };
};

export const getMonthlyCommits = (metrics) => {
  const months = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    months.push({
      label: d.toLocaleString("default", { month: "short" }),
      commits: metrics?.monthlyCommits?.[key] || 0
    });
  }
  return months;
};

export const getTopLanguages = (metrics) => {
  if (!metrics?.languagePercentages) return [];
  return Object.entries(metrics.languagePercentages)
    .map(([name, value]) => ({ name, percent: Math.round(value * 100) }))
    .sort((a, b) => b.percent - a.percent)
    .slice(0, 6);
};

export const getRadarData = (analysis) => {
  const s = analysis?.scoreBreakdown?.normalizedScores || {};
  return [
    { metric: "Activity", value: Math.round(s.activityScore || 0) },
    { metric: "Consistency", value: Math.round(s.consistencyScore || 0) },
    { metric: "Collab", value: Math.round(s.collaborationScore || 0) },
    { metric: "Reviews", value: Math.round(s.codeReviewScore || 0) },
    { metric: "Quality", value: Math.round(s.projectQualityScore || 0) },
    { metric: "Languages", value: Math.round(s.languageDiversityScore || 0) },
    { metric: "Frameworks", value: Math.round(s.frameworkScore || 0) },
    { metric: "Stars", value: Math.round(s.starScore || 0) }
  ];
};

export const getScoreBreakdown = (analysis) => {
  const s = analysis?.scoreBreakdown?.normalizedScores || {};
  return Object.entries(SCORE_LABELS)
    .map(([key, label]) => ({ key, label, value: Math.round(s[key] || 0) }))
    .sort((a, b) => b.value - a.value);
};

export const getQualityItems = (metrics) => {
  const q = metrics?.qualityIndicators || {};
  return [
    { label: "README", count: q.readme || 0 },
    { label: "CI/CD", count: q.ci || 0 },
    { label: "Tests", count: q.tests || 0 },
    { label: "Docker", count: q.docker || 0 },
    { label: "License", count: q.license || 0 }
  ];
};

export const getTopAlgoTags = (lc) => {
  if (!lc?.algorithms) return [];
  const advanced = lc.algorithms.advanced || [];
  const intermediate = lc.algorithms.intermediate || [];
  return [...advanced, ...intermediate]
    .sort((a, b) => b.problemsSolved - a.problemsSolved)
    .slice(0, 6);
};

export const getUniqueSkillKeys = (skills = []) => {
  const seen = new Set();
  return skills.filter((skill) => {
    const key = SKILL_ICON_KEY(skill);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

export const getLeetcodeOnlyLanguages = (metrics, lc) => {
  const ghKeys = new Set((metrics?.skills || []).map((s) => SKILL_ICON_KEY(s)));
  return (lc?.languages || [])
    .filter((l) => l.problemsSolved > 0 && !ghKeys.has(SKILL_ICON_KEY(l.languageName)))
    .sort((a, b) => b.problemsSolved - a.problemsSolved);
};
