import React, { useEffect, useRef, useState } from "react";
import {
  Activity,
  Bot,
  Boxes,
  ChevronRight,
  Database,
  GitBranch,
  Layers3,
  Lock,
  MessageSquare,
  Network,
  Radar,
  Search,
  ShieldCheck,
  Sparkles,
  Users,
  Workflow,
  Zap,
} from "lucide-react";
import { Layout } from "../components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/Card";

const stack = [
  { label: "Frontend", value: "React 19 + Vite + React Router + Tailwind + Framer Motion" },
  { label: "Backend", value: "Node.js + Express + Socket.IO + JWT cookies" },
  { label: "Database", value: "MongoDB + Mongoose schemas" },
  { label: "Async Work", value: "BullMQ worker backed by Redis" },
  { label: "Signals", value: "GitHub repo/activity metrics + optional LeetCode data" },
  { label: "Realtime", value: "Socket.IO rooms keyed as user:{profileId}" },
];

const architectureLayers = [
  {
    title: "Presentation Layer",
    icon: <Layers3 className="w-5 h-5 text-primary" />,
    points: [
      "Landing, public profile, leaderboard, developer dashboard, recruiter dashboard, referrals, messages, legal pages",
      "Global auth state from AuthContext and theme state from ThemeContext",
      "Protected developer routes for dashboard, referrals, and messages",
    ],
  },
  {
    title: "Application Layer",
    icon: <Workflow className="w-5 h-5 text-primary" />,
    points: [
      "Express routes split by auth, profile, analysis, ranking, recruiter, college verification, connections, referrals, and messages",
      "Socket.IO middleware authenticates from the same auth cookie used by HTTP routes",
      "Controllers coordinate validation, persistence, search pipelines, and side effects",
    ],
  },
  {
    title: "Domain Layer",
    icon: <Radar className="w-5 h-5 text-primary" />,
    points: [
      "Scoring engine normalizes GitHub metrics, applies weights, gaming penalties, trust, confidence, and optional LeetCode contribution",
      "Badge engine decorates users with derived labels such as education verification and skill badges",
      "Recruiter search joins Analysis with Profile and supports skill, score, college, branch, and batch filters",
    ],
  },
  {
    title: "Data + Infra Layer",
    icon: <Database className="w-5 h-5 text-primary" />,
    points: [
      "MongoDB stores user profiles, analyses, OTP records, referrals, connections, messages, and colleges",
      "Redis is used twice: request locks/cache invalidation and BullMQ queue transport",
      "Worker process performs long-running GitHub and LeetCode analysis off the request path",
    ],
  },
];

const schemaEntities = [
  {
    name: "Profile",
    collection: "profiles",
    color: "border-primary/25 bg-primary/10",
    headerColor: "bg-primary/15",
    iconBg: "bg-primary/20 text-primary",
    icon: "👤",
    footer: "timestamps: createdAt, updatedAt",
    fields: [
      { name: "_id", type: "ObjectId", badge: "PK" },
      { name: "githubId", type: "String", badge: "IDX" },
      { name: "email", type: "String", badge: "IDX" },
      { name: "username", type: "String", badge: "UNIQUE" },
      { name: "accountType", type: "enum  developer | recruiter" },
      { name: "name", type: "String" },
      { name: "avatarUrl", type: "String" },
      { name: "bio", type: "String" },
      { name: "college", type: "String" },
      { name: "branch", type: "String" },
      { name: "graduationYear", type: "Number" },
      { name: "currentCompany", type: "String" },
      { name: "role", type: "String" },
      { name: "openToReferral", type: "Boolean" },
      { name: "referralCompany", type: "String" },
      { name: "githubAccessToken", type: "String" },
      { name: "passwordHash", type: "String" },
      { name: "connectionCount", type: "Number  default: 0" },
      { name: "shortlists", type: "ObjectId[]  (recruiter only)" },
    ],
  },
  {
    name: "Analysis",
    collection: "analyses",
    color: "border-emerald-500/25 bg-emerald-500/10",
    headerColor: "bg-emerald-500/15",
    iconBg: "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400",
    icon: "📊",
    footer: "1:1 logical with Profile via githubId · timestamps",
    fields: [
      { name: "_id", type: "ObjectId", badge: "PK" },
      { name: "githubId", type: "String", badge: "FK" },
      { name: "status", type: "enum  queued | processing | completed | failed" },
      { name: "overallScore", type: "Number" },
      { name: "finalScore", type: "Number" },
      { name: "rawMetrics", type: "Object" },
      { name: "scoreBreakdown", type: "Object" },
      { name: "leetcodeMetrics", type: "Object" },
      { name: "leetcodeScore", type: "Number" },
      { name: "badges", type: "String[]" },
      { name: "eduBadge", type: "String" },
      { name: "error", type: "String" },
    ],
  },
  {
    name: "Connection",
    collection: "connections",
    color: "border-blue-500/25 bg-blue-500/10",
    headerColor: "bg-blue-500/15",
    iconBg: "bg-blue-500/20 text-blue-600 dark:text-blue-400",
    icon: "🔗",
    footer: "UNIQUE index on (requester, recipient) · timestamps",
    fields: [
      { name: "_id", type: "ObjectId", badge: "PK" },
      { name: "requester", type: "ObjectId", badge: "FK" },
      { name: "recipient", type: "ObjectId", badge: "FK" },
      { name: "status", type: "enum  pending | accepted | declined | blocked" },
      { name: "note", type: "String  (intro message)" },
    ],
  },
  {
    name: "Referral",
    collection: "referrals",
    color: "border-amber-500/25 bg-amber-500/10",
    headerColor: "bg-amber-500/15",
    iconBg: "bg-amber-500/20 text-amber-600 dark:text-amber-400",
    icon: "📨",
    footer: "UNIQUE index on (from, to, company) · timestamps",
    fields: [
      { name: "_id", type: "ObjectId", badge: "PK" },
      { name: "from", type: "ObjectId", badge: "FK" },
      { name: "to", type: "ObjectId", badge: "FK" },
      { name: "company", type: "String" },
      { name: "message", type: "String" },
      { name: "resumeUrl", type: "String" },
      { name: "status", type: "enum  pending | accepted | rejected" },
    ],
  },
  {
    name: "Message",
    collection: "messages",
    color: "border-border bg-card",
    headerColor: "bg-secondary/60",
    iconBg: "bg-secondary text-muted-foreground",
    icon: "💬",
    footer: "IDX on (sender, receiver, createdAt) · timestamps",
    fields: [
      { name: "_id", type: "ObjectId", badge: "PK" },
      { name: "sender", type: "ObjectId", badge: "FK" },
      { name: "receiver", type: "ObjectId", badge: "FK" },
      { name: "connectionId", type: "ObjectId", badge: "FK" },
      { name: "referralId", type: "ObjectId", badge: "FK" },
      { name: "text", type: "String" },
      { name: "readAt", type: "Date" },
    ],
  },
  {
    name: "College",
    collection: "colleges",
    color: "border-green-500/25 bg-green-500/10",
    headerColor: "bg-green-500/15",
    iconBg: "bg-green-500/20 text-green-600 dark:text-green-400",
    icon: "🏫",
    footer: "Lookup catalog · referenced by Profile.college",
    fields: [
      { name: "_id", type: "ObjectId", badge: "PK" },
      { name: "name", type: "String" },
      { name: "domain", type: "String  (email domain)" },
      { name: "location", type: "String" },
    ],
  },
  {
    name: "RecruiterOTP",
    collection: "recruiterotp",
    color: "border-red-500/25 bg-red-500/10",
    headerColor: "bg-red-500/15",
    iconBg: "bg-red-500/20 text-red-600 dark:text-red-400",
    icon: "🔐",
    footer: "TTL index auto-purges expired OTPs",
    fields: [
      { name: "_id", type: "ObjectId", badge: "PK" },
      { name: "email", type: "String", badge: "IDX" },
      { name: "otp", type: "String  (hashed)" },
      { name: "expiresAt", type: "Date", badge: "TTL" },
    ],
  },
  {
    name: "StudentCollegeVerification",
    collection: "studentcollegeverifications",
    color: "border-pink-500/25 bg-pink-500/10",
    headerColor: "bg-pink-500/15",
    iconBg: "bg-pink-500/20 text-pink-600 dark:text-pink-400",
    icon: "✅",
    footer: "TTL index auto-purges expired records",
    fields: [
      { name: "_id", type: "ObjectId", badge: "PK" },
      { name: "profileId", type: "ObjectId", badge: "FK" },
      { name: "academicEmail", type: "String" },
      { name: "status", type: "enum  pending | verified | failed" },
      { name: "expiresAt", type: "Date", badge: "TTL" },
    ],
  },
];

const flows = [
  {
    title: "Developer Onboarding + Analysis",
    icon: <Zap className="w-5 h-5 text-primary" />,
    steps: [
      "Frontend redirects to /api/auth/github",
      "Backend exchanges GitHub OAuth code for access token and upserts Profile",
      "JWT is stored in the auth HttpOnly cookie",
      "Developer triggers /api/analyze which rate-limits using Redis locks and cooldown checks",
      "BullMQ enqueues analyzeProfile job",
      "Worker fetches repos, computes metrics, runs score engine, stores Analysis, invalidates leaderboard cache",
    ],
  },
  {
    title: "Recruiter Search + Shortlisting",
    icon: <Search className="w-5 h-5 text-primary" />,
    steps: [
      "Recruiter registers or logs in using OTP/password flow",
      "Recruiter dashboard loads aggregate stats from completed Analysis records",
      "Search API joins Analysis with Profile and filters by score, skills, developer type, college, branch, and batch",
      "Results project a compact developer card with score, skills, repo stats, and profile details",
      "Recruiters persist custom shortlists as nested arrays on their Profile document",
    ],
  },
  {
    title: "Connections + Referrals",
    icon: <Users className="w-5 h-5 text-primary" />,
    steps: [
      "Profiles can send connection requests with an optional note",
      "Accepting a connection increments connectionCount on both profiles",
      "Referral requests can also auto-open a pending connection thread if one does not exist",
      "Referral recipient accepts or rejects the request; accepted referrals unlock messaging",
    ],
  },
  {
    title: "Messaging + Realtime",
    icon: <MessageSquare className="w-5 h-5 text-primary" />,
    steps: [
      "Socket.IO authenticates from auth cookie and joins each user to user:{profileId}",
      "HTTP POST /api/messages/:username validates that users are connected or share an accepted referral",
      "Message is stored in MongoDB and emitted to sender and receiver rooms",
      "Inbox view aggregates latest message per conversation and counts unread messages",
    ],
  },
];

const scoreWeights = [
  ["repoScore", "10%"],
  ["starScore", "10%"],
  ["forkScore", "5%"],
  ["activityScore", "15%"],
  ["consistencyScore", "10%"],
  ["streakScore", "5%"],
  ["collaborationScore", "10%"],
  ["issueScore", "5%"],
  ["languageDiversityScore", "10%"],
  ["frameworkScore", "5%"],
  ["projectQualityScore", "5%"],
  ["codeReviewScore", "10%"],
];

const apiModules = [
  {
    title: "Auth + Identity",
    endpoints: [
      "/api/auth/github, /api/auth/github/callback, /api/auth/me, /api/auth/logout",
      "/api/recruiter/auth/register/send-otp, verify-otp, login, me, logout",
    ],
  },
  {
    title: "Profile + Analysis",
    endpoints: [
      "/api/profile/me, /api/profile/:username, /api/profile/update",
      "/api/analyze, /api/analyze/status/:username",
    ],
  },
  {
    title: "Ranking + Discovery",
    endpoints: [
      "/api/ranking/leaderboard, /api/ranking/rank/:username",
      "/api/ranking/leaderboard/filter, /api/ranking/leaderboard/filter-options",
      "/api/ranking/leaderboard/:category, /api/ranking/leaderboard/:category/:username",
    ],
  },
  {
    title: "Social + Communication",
    endpoints: [
      "/api/connections/request/:username, accept/:id, decline/:id, list, pending, status/:username, suggestions",
      "/api/referrals/open, request/:username, incoming, received, sent, accept/:id, reject/:id",
      "/api/messages, /api/messages/:username",
    ],
  },
];

const operationalNotes = [
  "JWT auth is cookie-based for both HTTP and Socket.IO. There is no separate bearer-token client flow in the main UI.",
  "Leaderboard category results are cached in Redis for 10 minutes and invalidated after a successful analysis run.",
  "Analysis requests are protected by both cooldown checks and a short Redis lock to prevent duplicate queue submissions.",
  "The worker is a separate Node process and must be running for analysis jobs to complete.",
  "MongoDB TTL indexes automatically clean up OTP and student-verification records after expiry.",
];

const engineeringRisks = [
  "Recruiter data is modeled in both Profile and Recruiter schemas, but the active auth/search flow currently uses Profile documents. This is an architectural inconsistency worth consolidating.",
  "The backend currently hardcodes localhost origins for CORS and redirects, so deployment will need environment-driven host configuration.",
  "Redis is used by both cache and queue subsystems, but via separate client setup files. That works, but centralizing connection strategy would simplify operations.",
  "Some profile-derived suggestion logic references fields that are not strongly represented in the main schema, so recommendation quality depends on data hygiene.",
];

const navSections = [
  { id: "topology", label: "Topology", icon: Network },
  { id: "layers", label: "Layers", icon: Layers3 },
  { id: "domain-model", label: "Models", icon: Database },
  { id: "flows", label: "Flows", icon: Workflow },
  { id: "scoring", label: "Scoring", icon: Activity },
  { id: "apis", label: "APIs", icon: Boxes },
  { id: "security", label: "Security", icon: ShieldCheck },
  { id: "ops", label: "Ops", icon: Bot },
];

function Section({ id, eyebrow, title, description, children }) {
  return (
    <section id={id} data-engineering-section className="scroll-mt-28 space-y-6">
      <div className="space-y-3">
        <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-primary">
          {eyebrow}
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-balance">{title}</h2>
        {description && <p className="max-w-4xl text-sm sm:text-base text-muted-foreground">{description}</p>}
      </div>
      {children}
    </section>
  );
}

function SectionSidebar({ activeSection }) {
  const current = navSections.find((section) => section.id === activeSection);

  return (
    <div className="space-y-4">
      <Card className="border-primary/15 bg-primary/5">
        <CardHeader className="flex-col items-start gap-2">
          <CardTitle className="text-lg">Currently Reading</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="rounded-xl border border-primary/20 bg-primary/10 px-3 py-3">
            <div className="text-[11px] uppercase tracking-[0.22em] text-primary/80">Active Section</div>
            <div className="mt-1 text-base font-semibold text-foreground">{current?.label}</div>
          </div>
        </CardContent>
      </Card>

      <Card variant="glass" className="overflow-hidden border-primary/15">
        <CardHeader className="flex-col items-start gap-2">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Sparkles className="w-5 h-5 text-primary" />
            Engineering Guide
          </CardTitle>
          <CardDescription>Jump between sections and keep your place while reading.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {navSections.map((section, index) => {
            const Icon = section.icon;
            const active = activeSection === section.id;

            return (
              <button
                key={section.id}
                onClick={() => document.getElementById(section.id)?.scrollIntoView({ behavior: "smooth", block: "start" })}
                className={`group flex w-full items-center gap-3 rounded-xl border px-3 py-3 text-left transition-all ${
                  active
                    ? "border-primary/30 bg-primary/10 text-foreground shadow-sm"
                    : "border-transparent bg-background/60 text-muted-foreground hover:border-border hover:bg-card hover:text-foreground"
                }`}
              >
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                    active
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-muted-foreground group-hover:text-foreground"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[11px] uppercase tracking-[0.22em] opacity-60">0{index + 1}</div>
                  <div className="text-sm font-medium">{section.label}</div>
                </div>
                <ChevronRight className={`w-4 h-4 transition-transform ${active ? "translate-x-1 text-primary" : ""}`} />
              </button>
            );
          })}
        </CardContent>
      </Card>

      <Card className="border-primary/15 bg-primary/5">
        <CardHeader className="flex-col items-start gap-2">
          <CardTitle className="text-lg">Reading Path</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <div className="rounded-xl border border-border bg-card px-3 py-2">
            Start with <span className="font-medium text-foreground">Topology</span> for system shape.
          </div>
          <div className="rounded-xl border border-border bg-card px-3 py-2">
            Use <span className="font-medium text-foreground">Models</span> for persistence and relationships.
          </div>
          <div className="rounded-xl border border-border bg-card px-3 py-2">
            Jump to <span className="font-medium text-foreground">Flows</span> for real product behavior.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function BulletList({ items }) {
  return (
    <ul className="space-y-2 text-sm text-muted-foreground">
      {items.map((item) => (
        <li key={item} className="flex gap-3">
          <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function TopologyNode({ title, subtitle, tone = "default" }) {
  const tones = {
    default: "border-border bg-card text-foreground",
    primary: "border-primary/30 bg-primary/10 text-foreground",
    accent: "border-accent/30 bg-accent/10 text-foreground",
    success: "border-emerald-500/30 bg-emerald-500/10 text-foreground",
  };
  return (
    <div className={`rounded-2xl border p-4 shadow-sm ${tones[tone]}`}>
      <div className="text-sm font-semibold">{title}</div>
      <div className="mt-1 text-xs leading-5 text-muted-foreground">{subtitle}</div>
    </div>
  );
}

function RuntimeTopologyDiagram() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 lg:grid-cols-[1fr_auto_1fr_auto_1fr] lg:items-center">
        <TopologyNode
          title="React Frontend"
          subtitle="SPA with routes for landing, dashboard, leaderboard, public profiles, referrals, and messages"
          tone="primary"
        />
        <div className="hidden lg:flex justify-center text-primary text-2xl">→</div>
        <TopologyNode
          title="Express API + Socket.IO"
          subtitle="Cookie auth, REST routes, recruiter flows, ranking APIs, and realtime messaging entrypoint"
          tone="accent"
        />
        <div className="hidden lg:flex justify-center text-primary text-2xl">→</div>
        <TopologyNode
          title="MongoDB"
          subtitle="Profiles, analyses, connections, referrals, messages, OTPs, and college lookup data"
          tone="success"
        />
      </div>
      <div className="hidden lg:flex justify-center text-primary/70 text-2xl">↓</div>
      <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr_1fr]">
        <Card className="h-full border-primary/15 bg-primary/5">
          <CardHeader className="flex-col items-start gap-2">
            <CardTitle className="text-lg">API responsibilities</CardTitle>
            <CardDescription>What sits inside the main backend runtime.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                "GitHub OAuth + recruiter auth",
                "Profile read/update APIs",
                "Analysis trigger + status",
                "Leaderboard + category ranking",
                "Connections + referrals",
                "Messaging + inbox APIs",
              ].map((item) => (
                <div key={item} className="rounded-xl border border-border bg-card px-3 py-2 text-sm text-muted-foreground">
                  {item}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card className="h-full border-accent/15 bg-accent/5">
          <CardHeader className="flex-col items-start gap-2">
            <CardTitle className="text-lg">Redis + BullMQ</CardTitle>
            <CardDescription>Short-lived coordination and async job transport.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {["analysis request locks", "leaderboard cache", "analyzeProfile queue"].map((item) => (
              <div key={item} className="rounded-xl border border-border bg-card px-3 py-2 text-sm text-muted-foreground">
                {item}
              </div>
            ))}
          </CardContent>
        </Card>
        <Card className="h-full border-emerald-500/15 bg-emerald-500/5">
          <CardHeader className="flex-col items-start gap-2">
            <CardTitle className="text-lg">Analyze Worker</CardTitle>
            <CardDescription>Runs the heavy technical-evaluation pipeline out of band.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              "fetch GitHub repos and signals",
              "compute language, activity, collaboration, and quality metrics",
              "blend optional LeetCode metrics",
              "persist Analysis and invalidate ranking cache",
            ].map((item) => (
              <div key={item} className="rounded-xl border border-border bg-card px-3 py-2 text-sm text-muted-foreground">
                {item}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ─── Schema card badge styles ────────────────────────────────────────────────
function FieldBadge({ type }) {
  if (!type) return null;
  const styles = {
    PK: "bg-amber-100 text-amber-800 border border-amber-300 dark:bg-amber-900/40 dark:text-amber-300 dark:border-amber-700",
    FK: "bg-blue-100 text-blue-800 border border-blue-300 dark:bg-blue-900/40 dark:text-blue-300 dark:border-blue-700",
    IDX: "bg-secondary text-muted-foreground border border-border",
    UNIQUE: "bg-secondary text-muted-foreground border border-border",
    TTL: "bg-red-100 text-red-700 border border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800",
  };
  return (
    <span className={`inline-flex items-center rounded px-1.5 py-0.5 font-mono text-[10px] font-medium leading-none flex-shrink-0 ${styles[type] ?? styles.IDX}`}>
      {type}
    </span>
  );
}

function SchemaCard({ entity }) {
  return (
    <div className={`rounded-2xl border overflow-hidden ${entity.color} h-full flex flex-col`}>
      {/* Header */}
      <div className={`flex items-center gap-3 px-4 py-3 ${entity.headerColor} border-b border-border/60 flex-shrink-0`}>
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm flex-shrink-0 ${entity.iconBg}`}>
          {entity.icon}
        </div>
        <div className="min-w-0">
          <div className="text-sm font-semibold text-foreground font-mono leading-tight">{entity.name}</div>
          <div className="text-[11px] text-muted-foreground font-mono truncate">{entity.collection}</div>
        </div>
      </div>
      {/* Fields */}
      <div className="divide-y divide-border/50 overflow-y-auto max-h-[320px]">
        {entity.fields.map((field) => (
          <div
            key={field.name}
            className="flex items-center gap-2 px-4 py-[7px] hover:bg-background/40 transition-colors"
          >
            <span className="font-mono text-[12px] text-foreground min-w-[140px] flex-shrink-0 truncate">
              {field.name}
            </span>
            <span className="font-mono text-[11px] text-muted-foreground flex-1 truncate">
              {field.type}
            </span>
            {field.badge && <FieldBadge type={field.badge} />}
          </div>
        ))}
      </div>
      {/* Footer */}
      <div className="px-4 py-2 bg-background/30 border-t border-border/50 text-[11px] text-muted-foreground font-mono mt-auto">
        {entity.footer}
      </div>
    </div>
  );
}

// ─── Mermaid ER Diagram ───────────────────────────────────────────────────────
function ERDiagram() {
  const ref = useRef(null);

  useEffect(() => {
    let cancelled = false;

    async function renderDiagram() {
      try {
        const mermaid = (await import("https://esm.sh/mermaid@11/dist/mermaid.esm.min.mjs")).default;
        if (cancelled) return;

        const dark = window.matchMedia("(prefers-color-scheme: dark)").matches;

        mermaid.initialize({
          startOnLoad: false,
          theme: "base",
          fontFamily: "inherit",
          themeVariables: {
            darkMode: dark,
            fontSize: "13px",
            fontFamily: "inherit",
            lineColor: dark ? "#9c9a92" : "#73726c",
            textColor: dark ? "#c2c0b6" : "#3d3d3a",
            primaryColor: dark ? "#2a2832" : "#f0effe",
            primaryBorderColor: dark ? "#6b5fd4" : "#7f77dd",
            primaryTextColor: dark ? "#c2c0b6" : "#3d3d3a",
            attributeBackgroundColorEven: dark ? "#1e1e28" : "#f8f8fc",
            attributeBackgroundColorOdd: dark ? "#232330" : "#ffffff",
          },
        });

        const diagramDef = `erDiagram
  PROFILE {
    ObjectId _id PK
    string githubId
    string email
    string username
    string accountType
    string college
    boolean openToReferral
    int connectionCount
    array shortlists
  }
  ANALYSIS {
    ObjectId _id PK
    string githubId FK
    string status
    number overallScore
    number finalScore
    object rawMetrics
    object scoreBreakdown
    array badges
  }
  CONNECTION {
    ObjectId _id PK
    ObjectId requester FK
    ObjectId recipient FK
    string status
    string note
  }
  REFERRAL {
    ObjectId _id PK
    ObjectId from FK
    ObjectId to FK
    string company
    string status
    string resumeUrl
  }
  MESSAGE {
    ObjectId _id PK
    ObjectId sender FK
    ObjectId receiver FK
    ObjectId connectionId FK
    ObjectId referralId FK
    string text
    date readAt
  }
  COLLEGE {
    ObjectId _id PK
    string name
    string domain
  }
  RECRUITER_OTP {
    ObjectId _id PK
    string email
    string otp
    date expiresAt
  }
  STUDENT_VERIFY {
    ObjectId _id PK
    ObjectId profileId FK
    string academicEmail
    string status
    date expiresAt
  }

  PROFILE ||--o| ANALYSIS : "has (githubId)"
  PROFILE ||--o{ CONNECTION : "requester"
  PROFILE ||--o{ CONNECTION : "recipient"
  PROFILE ||--o{ REFERRAL : "sends"
  PROFILE ||--o{ REFERRAL : "receives"
  PROFILE ||--o{ MESSAGE : "sends"
  PROFILE ||--o{ MESSAGE : "receives"
  CONNECTION ||--o{ MESSAGE : "unlocks"
  REFERRAL ||--o{ MESSAGE : "unlocks"
  PROFILE }o--o| COLLEGE : "attends"
  PROFILE ||--o{ STUDENT_VERIFY : "verified via"`;

        const id = "er-diagram-" + Math.random().toString(36).slice(2);
        const { svg } = await mermaid.render(id, diagramDef);
        if (cancelled || !ref.current) return;

        ref.current.innerHTML = svg;

        // Round entity box corners
        ref.current.querySelectorAll("svg .node").forEach((node) => {
          const firstPath = node.querySelector("path[d]");
          if (!firstPath) return;
          const d = firstPath.getAttribute("d");
          const nums = d.match(/-?[\d.]+/g)?.map(Number);
          if (!nums || nums.length < 8) return;
          const xs = [nums[0], nums[2], nums[4], nums[6]];
          const ys = [nums[1], nums[3], nums[5], nums[7]];
          const x = Math.min(...xs), y = Math.min(...ys);
          const w = Math.max(...xs) - x, h = Math.max(...ys) - y;
          const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
          rect.setAttribute("x", x); rect.setAttribute("y", y);
          rect.setAttribute("width", w); rect.setAttribute("height", h);
          rect.setAttribute("rx", "8");
          for (const a of ["fill", "stroke", "stroke-width", "class", "style"]) {
            if (firstPath.hasAttribute(a)) rect.setAttribute(a, firstPath.getAttribute(a));
          }
          firstPath.replaceWith(rect);
        });

        // Strip borders from attribute rows
        ref.current.querySelectorAll("svg .row-rect-odd path, svg .row-rect-even path").forEach((p) => {
          p.setAttribute("stroke", "none");
        });
      } catch (err) {
        console.error("Mermaid render failed:", err);
      }
    }

    renderDiagram();
    return () => { cancelled = true; };
  }, []);

  return (
    <Card className="overflow-hidden border-primary/15 bg-gradient-to-b from-primary/5 to-transparent">
      <CardHeader className="flex-col items-start gap-2">
        <CardTitle className="text-lg">Entity Relationship Diagram</CardTitle>
        <CardDescription>
          Primary runtime data model showing cardinality and relationship ownership.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div
          ref={ref}
          className="w-full overflow-x-auto rounded-xl"
          style={{ minHeight: 200 }}
        >
          <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
            Loading diagram…
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function DatabaseSchemaSection() {
  return (
    <div className="space-y-6">
      <ERDiagram />

      <div className="grid gap-4 xl:grid-cols-3 auto-rows-fr">
        {schemaEntities.map((entity) => (
          <SchemaCard key={entity.name} entity={entity} />
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader className="flex-col items-start gap-2">
            <CardTitle className="text-lg">Profile-centric relations</CardTitle>
          </CardHeader>
          <CardContent>
            <BulletList
              items={[
                "One Profile can participate in many connections as requester or recipient.",
                "One Profile can send and receive many referral requests.",
                "One Profile can send and receive many messages.",
                "One Profile can have one logical Analysis record per GitHub identity.",
              ]}
            />
          </CardContent>
        </Card>
        <Card className="border-accent/20 bg-accent/5">
          <CardHeader className="flex-col items-start gap-2">
            <CardTitle className="text-lg">Messaging gate</CardTitle>
          </CardHeader>
          <CardContent>
            <BulletList
              items={[
                "Messages are allowed only when users have an accepted connection or an accepted referral.",
                "Each message may point back to the relationship that unlocked the chat.",
                "Inbox aggregation is derived from Message timestamps and readAt state.",
              ]}
            />
          </CardContent>
        </Card>
        <Card className="border-emerald-500/20 bg-emerald-500/5">
          <CardHeader className="flex-col items-start gap-2">
            <CardTitle className="text-lg">Model nuance</CardTitle>
          </CardHeader>
          <CardContent>
            <BulletList
              items={[
                "The live recruiter auth flow writes recruiter accounts into Profile with accountType='recruiter'.",
                "A separate Recruiter schema still exists in the repo as legacy/parallel modeling.",
                "If the system is simplified later, recruiter persistence is a good consolidation target.",
              ]}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function Engineering() {
  const [activeSection, setActiveSection] = useState(navSections[0].id);

  useEffect(() => {
    const nodes = Array.from(document.querySelectorAll("[data-engineering-section]"));
    if (!nodes.length) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

        if (visible[0]?.target?.id) {
          setActiveSection(visible[0].target.id);
        }
      },
      {
        rootMargin: "-18% 0px -55% 0px",
        threshold: [0.2, 0.35, 0.5, 0.7],
      }
    );

    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, []);

  return (
    <Layout>
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(99,102,241,0.16),transparent_34%),radial-gradient(circle_at_top_right,rgba(168,85,247,0.12),transparent_28%),linear-gradient(180deg,rgba(99,102,241,0.06),transparent_26%)]" />
        <div className="absolute inset-x-0 top-0 h-[560px] bg-[linear-gradient(135deg,rgba(99,102,241,0.07),transparent_45%,rgba(168,85,247,0.05))]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16 space-y-10">
          <section className="grid gap-8 xl:grid-cols-[1.25fr_0.75fr] items-start">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/80 px-4 py-2 text-xs text-muted-foreground backdrop-blur">
                <Network className="w-4 h-4 text-primary" />
                Interactive engineering reference for the entire SkillHire app
              </div>
              <div className="space-y-4">
                <h1 className="text-4xl sm:text-5xl xl:text-6xl font-extrabold tracking-tight text-balance">
                  SkillHire system design, data model, request flows, and runtime architecture
                </h1>
                <p className="max-w-4xl text-base sm:text-lg text-muted-foreground">
                  This page is a code-informed architecture map of the current product. It explains the frontend,
                  backend, worker, database entities, queueing model, scoring engine, search pipeline, realtime
                  messaging, and the main implementation nuances someone needs to understand the app quickly.
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {stack.map((item) => (
                  <div
                    key={item.label}
                    className="rounded-2xl border border-border bg-card/80 p-4 backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:border-primary/30"
                  >
                    <div className="text-xs uppercase tracking-[0.22em] text-muted-foreground">{item.label}</div>
                    <div className="mt-2 text-sm font-medium leading-6">{item.value}</div>
                  </div>
                ))}
              </div>
            </div>
            <Card variant="glass" className="border-primary/15">
              <CardHeader className="flex-col items-start gap-2">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Boxes className="w-5 h-5 text-primary" />
                  Product Surface
                </CardTitle>
                <CardDescription>
                  Two user modes share one codebase and one primary account collection.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-sm text-muted-foreground">
                <div className="rounded-xl border border-border bg-background/70 p-4">
                  <div className="font-semibold text-foreground">Developer mode</div>
                  <p className="mt-2">
                    GitHub OAuth login, profile enrichment, async analysis, public profile, leaderboard visibility,
                    referrals, connections, and messaging.
                  </p>
                </div>
                <div className="rounded-xl border border-border bg-background/70 p-4">
                  <div className="font-semibold text-foreground">Recruiter mode</div>
                  <p className="mt-2">
                    OTP/password auth, developer search, filters, shortlists, referral workflows,
                    accepted-connection messaging, and dashboard analytics.
                  </p>
                </div>
                <div className="rounded-xl border border-primary/20 bg-primary/10 p-4 text-primary">
                  The core architectural spine is: <strong>Profile</strong> + <strong>Analysis</strong> +{" "}
                  <strong>Redis/BullMQ worker</strong>.
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-primary/15 bg-primary/10 p-4 text-primary">
                    <div className="text-2xl font-bold">{navSections.length}</div>
                    <div className="mt-1 text-xs uppercase tracking-[0.18em]">Sections</div>
                  </div>
                  <div className="rounded-xl border border-primary/15 bg-primary/10 p-4 text-primary">
                    <div className="text-2xl font-bold">6</div>
                    <div className="mt-1 text-xs uppercase tracking-[0.18em]">Core Models</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          <div className="flex gap-2 overflow-x-auto pb-2 xl:hidden">
            {navSections.map((section) => {
              const active = activeSection === section.id;
              return (
                <button
                  key={section.id}
                  onClick={() => document.getElementById(section.id)?.scrollIntoView({ behavior: "smooth", block: "start" })}
                  className={`whitespace-nowrap rounded-full border px-4 py-2 text-sm transition-colors ${
                    active
                      ? "border-primary/30 bg-primary text-primary-foreground"
                      : "border-border bg-card text-muted-foreground"
                  }`}
                >
                  {section.label}
                </button>
              );
            })}
          </div>

          <div className="grid gap-8 xl:grid-cols-[290px_minmax(0,1fr)]">
            <aside className="hidden xl:block">
              <div className="sticky top-24">
                <SectionSidebar activeSection={activeSection} />
              </div>
            </aside>

            <div className="space-y-14">
          <Section
            id="topology"
            eyebrow="Topology"
            title="Runtime topology"
            description="SkillHire is a split frontend/backend system with a separate worker for heavy analysis and Redis for both queue transport and caching."
          >
            <RuntimeTopologyDiagram />
          </Section>

          <Section
            id="layers"
            eyebrow="Architecture"
            title="Application layers"
            description="The codebase is organized around pages/components on the frontend and route/controller/service/model boundaries on the backend."
          >
            <div className="grid gap-5 lg:grid-cols-2">
              {architectureLayers.map((layer) => (
                <Card key={layer.title} hover className="h-full">
                  <CardHeader className="flex-col items-start gap-3">
                    <div className="flex items-center gap-3">
                      <div className="rounded-xl border border-primary/20 bg-primary/10 p-2">{layer.icon}</div>
                      <CardTitle className="text-lg">{layer.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <BulletList items={layer.points} />
                  </CardContent>
                </Card>
              ))}
            </div>
          </Section>

          {/* ── Merged Data Model + ER Diagram section ── */}
          <Section
            id="domain-model"
            eyebrow="Models"
            title="Core data model"
            description="The database centers on Profile and Analysis, then layers social and messaging entities on top. Each card shows field names, types, and key constraints exactly as modeled in Mongoose."
          >
            <DatabaseSchemaSection />
          </Section>

          <Section
            id="flows"
            eyebrow="Flows"
            title="Primary user and system flows"
            description="These are the highest-value end-to-end paths in the current application."
          >
            <div className="grid gap-5 xl:grid-cols-2">
              {flows.map((flow) => (
                <Card key={flow.title} hover className="h-full">
                  <CardHeader className="flex-col items-start gap-3">
                    <div className="flex items-center gap-3">
                      <div className="rounded-xl border border-primary/20 bg-primary/10 p-2">{flow.icon}</div>
                      <CardTitle className="text-lg">{flow.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ol className="space-y-3 text-sm text-muted-foreground">
                      {flow.steps.map((step, index) => (
                        <li key={step} className="flex gap-3">
                          <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                            {index + 1}
                          </span>
                          <span className="pt-0.5">{step}</span>
                        </li>
                      ))}
                    </ol>
                  </CardContent>
                </Card>
              ))}
            </div>
          </Section>

          <Section
            id="scoring"
            eyebrow="Scoring"
            title="How the SkillHire score is computed"
            description="The worker calculates normalized technical signals, applies weights, subtracts penalties, multiplies by trust, and optionally blends in LeetCode."
          >
            <div className="grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
              <Card className="h-full">
                <CardHeader className="flex-col items-start gap-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Activity className="w-5 h-5 text-primary" />
                    Score pipeline
                  </CardTitle>
                  <CardDescription>Implemented by the analysis worker and scoring services.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 text-sm text-muted-foreground">
                  <div className="rounded-xl border border-border bg-secondary/50 p-4 font-mono text-xs">
                    normalize(rawMetrics) → weighted score → gaming penalty → trust multiplier → optional LeetCode
                  </div>
                  <BulletList
                    items={[
                      "Gaming penalties apply for suspicious patterns like many repos with zero stars, commit spikes with low active weeks, or PR spam with low merges.",
                      "Trust score reduces the result when evidence is weak, such as zero stars, zero external PRs, or very low active weeks.",
                      "Confidence score is also computed so the system can explain how much evidence exists behind the final number.",
                      "If LeetCode data exists, GitHub score is scaled to 85% and LeetCode contributes up to 15%; no LeetCode does not create a penalty.",
                    ]}
                  />
                </CardContent>
              </Card>
              <Card className="h-full">
                <CardHeader className="flex-col items-start gap-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <GitBranch className="w-5 h-5 text-primary" />
                    Weight map
                  </CardTitle>
                  <CardDescription>Current weights from weightService.js.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {scoreWeights.map(([name, weight]) => (
                      <div key={name} className="flex items-center justify-between rounded-xl border border-border bg-card p-3 text-sm">
                        <span className="font-mono text-foreground">{name}</span>
                        <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">{weight}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </Section>

          <Section
            id="apis"
            eyebrow="APIs"
            title="Backend API surface"
            description="The backend is intentionally route-grouped by product capability."
          >
            <div className="grid gap-5 xl:grid-cols-2">
              {apiModules.map((group) => (
                <Card key={group.title}>
                  <CardHeader className="flex-col items-start gap-2">
                    <CardTitle className="text-lg">{group.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <BulletList items={group.endpoints} />
                  </CardContent>
                </Card>
              ))}
            </div>
          </Section>

          <Section
            id="security"
            eyebrow="Security"
            title="Trust, auth, and operational controls"
            description="These are the safeguards and runtime behaviors directly visible in the code."
          >
            <div className="grid gap-5 lg:grid-cols-3">
              <Card className="h-full">
                <CardHeader className="flex-col items-start gap-3">
                  <Lock className="w-5 h-5 text-primary" />
                  <CardTitle className="text-lg">Authentication</CardTitle>
                </CardHeader>
                <CardContent>
                  <BulletList
                    items={[
                      "Developer accounts use GitHub OAuth and a JWT auth cookie.",
                      "Recruiter accounts use OTP registration plus password login and the same JWT cookie pattern.",
                      "Protected APIs resolve the current user from the cookie into a Profile document.",
                    ]}
                  />
                </CardContent>
              </Card>
              <Card className="h-full">
                <CardHeader className="flex-col items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-primary" />
                  <CardTitle className="text-lg">Abuse Controls</CardTitle>
                </CardHeader>
                <CardContent>
                  <BulletList
                    items={[
                      "Analysis requests are throttled with Redis locks and cooldown windows.",
                      "Duplicate connection and referral requests are blocked by compound indexes and controller checks.",
                      "Message sends are gated behind accepted connection or accepted referral status.",
                    ]}
                  />
                </CardContent>
              </Card>
              <Card className="h-full">
                <CardHeader className="flex-col items-start gap-3">
                  <Bot className="w-5 h-5 text-primary" />
                  <CardTitle className="text-lg">Async Reliability</CardTitle>
                </CardHeader>
                <CardContent>
                  <BulletList
                    items={[
                      "BullMQ jobs retry with exponential backoff.",
                      "Analysis records move through queued → processing → completed/failed states.",
                      "Worker completion invalidates leaderboard cache so fresh rankings appear after re-analysis.",
                    ]}
                  />
                </CardContent>
              </Card>
            </div>
          </Section>

          <Section
            id="ops"
            eyebrow="Operations"
            title="Operational notes and architecture caveats"
            description="These details matter for anyone maintaining or extending the system."
          >
            <div className="grid gap-5 xl:grid-cols-[1fr_1fr]">
              <Card>
                <CardHeader className="flex-col items-start gap-2">
                  <CardTitle className="text-lg">What to know in production</CardTitle>
                </CardHeader>
                <CardContent>
                  <BulletList items={operationalNotes} />
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex-col items-start gap-2">
                  <CardTitle className="text-lg">Current architecture caveats</CardTitle>
                </CardHeader>
                <CardContent>
                  <BulletList items={engineeringRisks} />
                </CardContent>
              </Card>
            </div>
          </Section>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
