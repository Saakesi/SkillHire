import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
    Code2, Star, GitFork, GitPullRequest, GitMerge, Flame,
    Calendar, Activity, ExternalLink, AlertCircle, PlayCircle,
    Pencil, Check, X, MessageSquare, Eye, Trophy, Shield,
    Zap, Copy, GitBranch, Award, BarChart3, RefreshCw,
    CheckCircle2, XCircle, FileText, TestTube, Container, BookOpen
} from "lucide-react";
import {
    RadarChart, Radar, PolarGrid, PolarAngleAxis,
    PolarRadiusAxis, ResponsiveContainer, Tooltip
} from "recharts";
import { useAuth } from "../context/AuthContext";
import { Layout } from "../components/layout/Layout";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Avatar } from "../components/ui/Avatar";
import { PageLoader } from "../components/ui/Loader";
import ProgressBar from "../components/ui/ProgressBar";
import CollegeSelect from "@/components/ui/CollegeSelect";

const API = import.meta.env.VITE_API_URL;

const LANGUAGE_COLORS = {
    javascript: "#f7df1e", typescript: "#3178c6", python: "#3776ab",
    java: "#f89820", go: "#00ADD8", rust: "#dea584", c: "#A8B9CC",
    "c++": "#00599C", cpp: "#00599C", "c#": "#239120", csharp: "#239120",
    php: "#777BB4", ruby: "#CC342D", swift: "#FA7343", kotlin: "#7F52FF",
    dart: "#0175C2", shell: "#89e051", html: "#e34c26", css: "#264de4",
    r: "#276DC3", scala: "#DC322F", elixir: "#6E4A7E",
};

const TECH_ICONS = {
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
    r: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/r/r-original.svg",
};

// Normalize any skill/language name → TECH_ICONS key
const SKILL_ICON_KEY = (name) => {
    const map = {
        "c++": "cpp", "c#": "csharp",
        "python3": "python", "python2": "python",
        "golang": "go",
        "node.js": "nodejs", "nodejs": "nodejs",
        "next.js": "nextjs",
        "vue": "vuejs", "vue.js": "vuejs",
        "angular": "angular", "angularjs": "angular",
        "nestjs": "nestjs", "nest.js": "nestjs",
    };
    const lower = name.toLowerCase();
    return map[lower] ?? lower;
};

const SCORE_LABELS = {
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
    issueScore: "Issues",
};

const BADGE_DESCRIPTIONS = {
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

const formatBadgeLabel = (badge) =>
    badge.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());

const getBadgeDescription = (badge) => {
    const key = badge.toLowerCase().replace(/\s+/g, "_");
    if (BADGE_DESCRIPTIONS[key]) return BADGE_DESCRIPTIONS[key];
    if (key.includes("verified")) return "Profile verification badge based on trusted identity signals.";
    return "Awarded based on your combined GitHub, project quality, and coding activity signals.";
};

const fadeUp = {
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.4 }
};

function StatCard({ icon, label, value, color = "text-primary" }) {
    return (
        <div className="flex flex-col gap-1 p-4 rounded-xl bg-card border border-border hover:border-primary/30 transition-colors">
            <div className={`${color} mb-1`}>{icon}</div>
            <span className="text-2xl font-bold font-mono">{value ?? "—"}</span>
            <span className="text-xs text-muted-foreground">{label}</span>
        </div>
    );
}

function ScoreCircle({ score }) {
    const radius = 54;
    const circumference = 2 * Math.PI * radius;
    const progress = (Math.min(score, 100) / 100) * circumference;

    const color = score >= 75 ? "#22c55e" : score >= 50 ? "#f59e0b" : "#6366f1";

    return (
        <div className="relative inline-flex items-center justify-center w-36 h-36">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 128 128">
                <circle cx="64" cy="64" r={radius} stroke="currentColor"
                    strokeWidth="10" fill="none" className="text-border" />
                <motion.circle
                    cx="64" cy="64" r={radius}
                    stroke={color}
                    strokeWidth="10" fill="none"
                    strokeLinecap="round"
                    initial={{ strokeDasharray: `0 ${circumference}` }}
                    animate={{ strokeDasharray: `${progress} ${circumference}` }}
                    transition={{ duration: 1.4, ease: "easeOut", delay: 0.3 }}
                />
            </svg>
            <div className="absolute text-center">
                <span className="text-3xl font-bold font-mono">{Math.round(score)}</span>
                <span className="block text-xs text-muted-foreground">/ 100</span>
            </div>
        </div>
    );
}

function SectionTitle({ icon, children }) {
    return (
        <div className="flex items-center gap-2 mb-4">
            <span className="text-primary">{icon}</span>
            <h3 className="font-semibold text-base">{children}</h3>
        </div>
    );
}

function LeetcodeSection({ lc, lcScore, topAlgoTags }) {
    if (!lc?.solved) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.4 }}
        >
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        <span className="flex items-center gap-2">
                            <Trophy className="w-4 h-4 text-yellow-500" /> LeetCode Score
                        </span>
                        <span className="text-sm font-normal text-muted-foreground">
                            <span>: </span><span className="font-bold font-mono text-foreground">{lcScore}</span>/100
                        </span>
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    <div className="grid grid-cols-4 gap-2">
                        <div className="text-center py-2.5 px-2 rounded-lg bg-secondary">
                            <div className="text-lg font-bold font-mono">{lc.solved.total}</div>
                            <div className="text-xs text-muted-foreground">Total</div>
                        </div>
                        <div className="text-center py-2.5 px-2 rounded-lg bg-green-500/10 border border-green-500/20">
                            <div className="text-lg font-bold font-mono text-green-500">{lc.solved.easy}</div>
                            <div className="text-xs text-muted-foreground">Easy</div>
                        </div>
                        <div className="text-center py-2.5 px-2 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                            <div className="text-lg font-bold font-mono text-yellow-500">{lc.solved.medium}</div>
                            <div className="text-xs text-muted-foreground">Medium</div>
                        </div>
                        <div className="text-center py-2.5 px-2 rounded-lg bg-red-500/10 border border-red-500/20">
                            <div className="text-lg font-bold font-mono text-red-500">{lc.solved.hard}</div>
                            <div className="text-xs text-muted-foreground">Hard</div>
                        </div>
                    </div>

                    {lc.contest?.rating > 0 && (
                        <div className="flex items-center gap-0 rounded-lg bg-secondary overflow-hidden divide-x divide-border">
                            <div className="flex-1 text-center py-2.5 px-3">
                                <div className="text-xs text-muted-foreground">Rating</div>
                                <div className="text-base font-bold font-mono">{Math.round(lc.contest.rating)}</div>
                            </div>
                            {lc.contest.globalRank && (
                                <div className="flex-1 text-center py-2.5 px-3">
                                    <div className="text-xs text-muted-foreground">Global Rank</div>
                                    <div className="text-base font-bold font-mono">#{lc.contest.globalRank.toLocaleString()}</div>
                                </div>
                            )}
                            {lc.contest.contestsAttended > 0 && (
                                <div className="flex-1 text-center py-2.5 px-3">
                                    <div className="text-xs text-muted-foreground">Contests</div>
                                    <div className="text-base font-bold font-mono">{lc.contest.contestsAttended}</div>
                                </div>
                            )}
                        </div>
                    )}

                    {topAlgoTags.length > 0 && (
                        <div>
                            <p className="text-xs text-muted-foreground mb-2">Top Algorithm Tags</p>
                            <div className="flex flex-wrap gap-2">
                                {topAlgoTags.map(tag => (
                                    <span key={tag.tagName}
                                        className="px-2 py-1 rounded-lg text-xs bg-primary/10 text-primary border border-primary/20">
                                        {tag.tagName} · {tag.problemsSolved}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </motion.div>
    );
}

export const DeveloperDashboard = () => {
    const { profile, isAuthenticated } = useAuth();

    const [analysis, setAnalysis] = useState(null);
    const [metrics, setMetrics] = useState(null);
    const [badges, setBadges] = useState([]);
    const [status, setStatus] = useState(null);
    const [analysisLoading, setAnalysisLoading] = useState(true);
    const [updatedAt, setUpdatedAt] = useState(null);
    const [loading, setLoading] = useState(false);
    const [polling, setPolling] = useState(false);
    const [copied, setCopied] = useState(false);

    const [editingBio, setEditingBio] = useState(false);
    const [bio, setBio] = useState(profile?.bio || "");
    const [savingBio, setSavingBio] = useState(false);

    const [editingLeetcode, setEditingLeetcode] = useState(false);
    const [leetcodeUsername, setLeetcodeUsername] = useState(profile?.leetcodeUsername || "");
    const [savingLeetcode, setSavingLeetcode] = useState(false);
    const [toastMessage, setToastMessage] = useState("");

    const [editingCollege, setEditingCollege] = useState(false);
    const [college, setCollege] = useState(profile?.college || null);
    const [branch, setBranch] = useState(profile?.branch || "");
    const [graduationYear, setGraduationYear] = useState(profile?.graduationYear || "");
    const [savingCollege, setSavingCollege] = useState(false);
    const [pendingConnections, setPendingConnections] = useState([]);
    const [connectionsLoading, setConnectionsLoading] = useState(false);
    const [connectionActioningId, setConnectionActioningId] = useState("");

    const username = profile?.username;

    useEffect(() => {
        if (!toastMessage) return;
        const timer = setTimeout(() => setToastMessage(""), 2600);
        return () => clearTimeout(timer);
    }, [toastMessage]);

    useEffect(() => {
        if (profile) {
            setCollege(profile.college || null);
            setBranch(profile.branch || "");
            setGraduationYear(profile.graduationYear || "");
        }
    }, [profile]);

    // Fetch existing analysis on mount
    useEffect(() => {
        if (!username) return;
        setAnalysisLoading(true);
        axios.get(`${API}/api/analyze/status/${username}`)
            .then(res => {
                setAnalysis(res.data);
                if (res.data?.rawMetrics) {
                    setMetrics(res.data.rawMetrics);
                    setBadges(res.data.badges || []);
                    setUpdatedAt(res.data.updatedAt);
                    setStatus(res.data.status);
                }
                if (res.data.status === "processing" || res.data.status === "queued") {
                    setPolling(true);
                }
            })
            .catch(console.error)
            .finally(() => setAnalysisLoading(false));
    }, [username]);

    useEffect(() => {
        if (!isAuthenticated) return;

        const loadPendingConnections = async () => {
            setConnectionsLoading(true);
            try {
                const res = await axios.get(`${API}/api/connections/pending`, { withCredentials: true });
                setPendingConnections(res.data?.pending || []);
            } catch {
                setPendingConnections([]);
            } finally {
                setConnectionsLoading(false);
            }
        };

        loadPendingConnections();
    }, [isAuthenticated]);

    const refreshPendingConnections = async () => {
        const res = await axios.get(`${API}/api/connections/pending`, { withCredentials: true });
        setPendingConnections(res.data?.pending || []);
    };

    const acceptConnection = async (connectionId) => {
        setConnectionActioningId(connectionId);
        try {
            await axios.post(`${API}/api/connections/accept/${connectionId}`, {}, { withCredentials: true });
            await refreshPendingConnections();
        } finally {
            setConnectionActioningId("");
        }
    };

    const declineConnection = async (connectionId) => {
        setConnectionActioningId(connectionId);
        try {
            await axios.post(`${API}/api/connections/decline/${connectionId}`, {}, { withCredentials: true });
            await refreshPendingConnections();
        } finally {
            setConnectionActioningId("");
        }
    };

    // Poll while analysis is running
    useEffect(() => {
        if (!polling) return;
        const interval = setInterval(async () => {
            try {
                const res = await axios.get(`${API}/api/analyze/status/${username}`, { withCredentials: true });
                setStatus(res.data.status);
                if (res.data.status === "completed") {
                    setAnalysis(res.data);
                    setMetrics(res.data.rawMetrics);
                    setBadges(res.data.badges || []);
                    setUpdatedAt(res.data.updatedAt);
                    setPolling(false);
                    clearInterval(interval);
                }
            } catch (err) {
                console.error(err);
            }
        }, 2500);
        return () => clearInterval(interval);
    }, [polling, username]);

    const handleAnalyze = async () => {
        try {
            setLoading(true);
            await axios.post(`${API}/api/analyze`, {}, { withCredentials: true });
            setStatus("queued");
            setPolling(true);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const saveBio = async () => {
        setSavingBio(true);
        try {
            await axios.put(`${API}/api/profile/update`, { bio }, { withCredentials: true });
            setEditingBio(false);
        } catch (err) {
            console.error(err);
        } finally {
            setSavingBio(false);
        }
    };

    const saveLeetcodeUsername = async () => {
        setSavingLeetcode(true);
        try {
            const normalizedLeetcodeUsername = (leetcodeUsername || "").trim();
            await axios.put(`${API}/api/profile/update`, { leetcodeUsername: normalizedLeetcodeUsername }, { withCredentials: true });
            setLeetcodeUsername(normalizedLeetcodeUsername);
            setEditingLeetcode(false);
            setToastMessage(
                normalizedLeetcodeUsername
                    ? "LeetCode username saved. Re-analyze to refresh your score."
                    : "LeetCode username removed. Re-analyze to refresh your score."
            );
        } catch (err) {
            console.error(err);
            setToastMessage("Could not save LeetCode username. Please try again.");
        } finally {
            setSavingLeetcode(false);
        }
    };

    const saveCollege = async () => {
        setSavingCollege(true);

        try {
            const payload = {
                branch,
                graduationYear
            };

            // only include college if selected
            if (college) {
                payload.college = {
                    id: college.id,
                    name: college.name,
                    country: college.country
                };
            }

            const res = await axios.put(
                `${API}/api/profile/update`,
                payload,
                { withCredentials: true }
            );

            // 🔥 update local UI immediately
            setCollege(res.data.college || null);
            setBranch(res.data.branch || "");
            setGraduationYear(res.data.graduationYear || "");

            setEditingCollege(false);

        } catch (err) {
            console.error(err);
        } finally {
            setSavingCollege(false);
        }
    };

    const copyProfileUrl = () => {
        const url = `${window.location.origin}/profile/${username}`;
        navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    // Monthly commits for bar chart
    const monthlyCommits = useMemo(() => {
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
    }, [metrics]);

    const maxCommits = Math.max(...monthlyCommits.map(m => m.commits), 1);

    // Top 5 languages
    const topLanguages = useMemo(() => {
        if (!metrics?.languagePercentages) return [];
        return Object.entries(metrics.languagePercentages)
            .map(([name, value]) => ({ name, percent: Math.round(value * 100) }))
            .sort((a, b) => b.percent - a.percent)
            .slice(0, 6);
    }, [metrics]);

    // Radar data — 8 key metrics
    const radarData = useMemo(() => {
        const s = analysis?.scoreBreakdown?.normalizedScores || {};
        return [
            { metric: "Activity", value: Math.round(s.activityScore || 0) },
            { metric: "Consistency", value: Math.round(s.consistencyScore || 0) },
            { metric: "Collab", value: Math.round(s.collaborationScore || 0) },
            { metric: "Reviews", value: Math.round(s.codeReviewScore || 0) },
            { metric: "Quality", value: Math.round(s.projectQualityScore || 0) },
            { metric: "Languages", value: Math.round(s.languageDiversityScore || 0) },
            { metric: "Frameworks", value: Math.round(s.frameworkScore || 0) },
            { metric: "Stars", value: Math.round(s.starScore || 0) },
        ];
    }, [analysis]);

    // Score breakdown list (sorted by value desc)
    const scoreBreakdown = useMemo(() => {
        const s = analysis?.scoreBreakdown?.normalizedScores || {};
        return Object.entries(SCORE_LABELS)
            .map(([key, label]) => ({ key, label, value: Math.round(s[key] || 0) }))
            .sort((a, b) => b.value - a.value);
    }, [analysis]);

    // Quality indicators
    const qualityItems = useMemo(() => {
        const q = metrics?.qualityIndicators || {};
        return [
            { icon: <FileText className="w-4 h-4" />, label: "README", count: q.readme || 0 },
            { icon: <Zap className="w-4 h-4" />, label: "CI/CD", count: q.ci || 0 },
            { icon: <TestTube className="w-4 h-4" />, label: "Tests", count: q.tests || 0 },
            { icon: <Container className="w-4 h-4" />, label: "Docker", count: q.docker || 0 },
            { icon: <BookOpen className="w-4 h-4" />, label: "License", count: q.license || 0 },
        ];
    }, [metrics]);

    // LeetCode
    const lc = analysis?.leetcodeMetrics;
    const lcScore = analysis?.leetcodeScore || 0;
    const normalizedLeetcodeUsername = (leetcodeUsername || "").trim();
    const hasLeetcodeUsername = normalizedLeetcodeUsername.length > 0;
    const hasLeetcodeData = Boolean(
        lc && (
            (lc.solved?.total || 0) > 0 ||
            (lc.contest?.rating || 0) > 0 ||
            (lc.languages || []).some((item) => (item?.problemsSolved || 0) > 0) ||
            (lc.algorithms?.advanced || []).length > 0 ||
            (lc.algorithms?.intermediate || []).length > 0 ||
            (lc.algorithms?.fundamental || []).length > 0
        )
    );
    const shouldRenderLeetcodeSection = hasLeetcodeUsername && hasLeetcodeData;

    // Top algorithm tags (advanced first, then intermediate)
    const topAlgoTags = useMemo(() => {
        if (!lc?.algorithms) return [];
        const advanced = lc.algorithms.advanced || [];
        const intermediate = lc.algorithms.intermediate || [];
        return [...advanced, ...intermediate]
            .sort((a, b) => b.problemsSolved - a.problemsSolved)
            .slice(0, 6);
    }, [lc]);

    const startLeetcodeEdit = () => {
        setEditingLeetcode(true);
        window.scrollTo({ top: 0, behavior: "smooth" });
        setTimeout(() => {
            document.getElementById("leetcode-input")?.focus();
        }, 180);
    };

    if (!profile) return <PageLoader />;

    const overallScore = analysis?.overallScore || 0;
    const isAnalyzing = polling || status === "processing" || status === "queued";

    return (
        <Layout showFooter={false}>
            <div className="min-h-screen bg-background pb-16">
                {toastMessage && (
                    <div className="fixed top-20 right-4 z-[100] max-w-xs rounded-xl border border-primary/20 bg-card px-4 py-2.5 text-sm shadow-lg">
                        {toastMessage}
                    </div>
                )}

                {/* ─── PROFILE HEADER ─── */}
                <div className="border-b border-border bg-card/50 backdrop-blur-sm">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
                        <div className="flex flex-col md:flex-row md:items-start gap-6">

                            {/* Avatar + Info */}
                            <div className="flex items-start gap-5 flex-1">
                                <Avatar
                                    src={profile.avatarUrl}
                                    name={profile.name || profile.username}
                                    size="xl"
                                />
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-3 flex-wrap">
                                        <h1 className="text-2xl font-bold truncate">
                                            {profile.name || profile.username}
                                        </h1>
                                        {metrics?.developerType && (
                                            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20">
                                                {metrics.developerType}
                                            </span>
                                        )}
                                        {metrics?.primaryLanguage && (
                                            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground">
                                                {metrics.primaryLanguage}
                                            </span>
                                        )}
                                    </div>

                                    <a
                                        href={`https://github.com/${profile.username}`}
                                        target="_blank" rel="noopener noreferrer"
                                        className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1 mt-0.5 w-fit"
                                    >
                                        @{profile.username}
                                        <ExternalLink className="w-3 h-3" />
                                    </a>

                                    {/* Bio */}
                                    <div className="mt-2">
                                        {!editingBio ? (
                                            <div className="flex items-start gap-2">
                                                <p className="text-sm text-muted-foreground">
                                                    {bio || "Add a bio…"}
                                                </p>
                                                <button onClick={() => setEditingBio(true)}
                                                    className="text-muted-foreground hover:text-primary flex-shrink-0 mt-0.5">
                                                    <Pencil className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col gap-2 max-w-md">
                                                <textarea value={bio} onChange={e => setBio(e.target.value)}
                                                    rows={2} placeholder="Write something about yourself…"
                                                    className="w-full border border-border rounded-lg p-2 text-sm bg-background resize-none focus:outline-none focus:ring-1 focus:ring-primary" />
                                                <div className="flex gap-2">
                                                    <Button size="sm" onClick={saveBio} disabled={savingBio}>
                                                        {savingBio ? "Saving…" : "Save"}
                                                    </Button>
                                                    <Button size="sm" variant="outline"
                                                        onClick={() => { setEditingBio(false); setBio(profile.bio || ""); }}>
                                                        Cancel
                                                    </Button>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* LeetCode username */}
                                    <div className="mt-2">
                                        {editingLeetcode && (
                                            <div className="flex items-center gap-2">
                                                <input
                                                    id="leetcode-input"
                                                    value={leetcodeUsername}
                                                    onChange={e => setLeetcodeUsername(e.target.value)}
                                                    placeholder="LeetCode username"
                                                    className="border border-border rounded-lg px-2 py-1 text-sm bg-background focus:outline-none focus:ring-1 focus:ring-primary w-44"
                                                />
                                                <Button size="sm" onClick={saveLeetcodeUsername} disabled={savingLeetcode}>
                                                    {savingLeetcode ? "…" : "Save"}
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => {
                                                        setEditingLeetcode(false);
                                                        setLeetcodeUsername(profile.leetcodeUsername || "");
                                                    }}
                                                >
                                                    Cancel
                                                </Button>
                                            </div>
                                        )}

                                        {!editingLeetcode && hasLeetcodeUsername && (
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs text-muted-foreground">
                                                    LeetCode: <span className="text-foreground font-medium">{normalizedLeetcodeUsername}</span>
                                                </span>
                                                <button onClick={startLeetcodeEdit}
                                                    className="text-muted-foreground hover:text-primary">
                                                    <Pencil className="w-3 h-3" />
                                                </button>
                                            </div>
                                        )}

                                        {!editingLeetcode && !hasLeetcodeUsername && (
                                            <button
                                                onClick={startLeetcodeEdit}
                                                className="text-xs font-medium text-primary hover:underline"
                                            >
                                                Add Username
                                            </button>
                                        )}
                                    </div>
                                    {/* 🎓 College Info */}
                                    <div className="mt-2">
                                        {!editingCollege ? (
                                            <div className="flex items-center gap-2 flex-wrap">
                                                {college?.name ? (
                                                    <>
                                                        <span className="text-sm text-foreground font-medium">
                                                            {college.name}
                                                        </span>

                                                        {branch && (
                                                            <span className="px-2 py-0.5 rounded bg-secondary text-xs">
                                                                {branch}
                                                            </span>
                                                        )}

                                                        {graduationYear && (
                                                            <span className="px-2 py-0.5 rounded bg-secondary text-xs">
                                                                {graduationYear}
                                                            </span>
                                                        )}
                                                    </>
                                                ) : (
                                                    <span className="text-sm text-muted-foreground italic">
                                                        Add your college details
                                                    </span>
                                                )}

                                                <button
                                                    onClick={() => setEditingCollege(true)}
                                                    className="text-muted-foreground hover:text-primary"
                                                >
                                                    <Pencil className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col gap-2 max-w-md">

                                                {/* College Search */}
                                                <CollegeSelect value={college} onChange={setCollege} />

                                                {/* Branch */}
                                                <select
                                                    value={branch}
                                                    onChange={(e) => setBranch(e.target.value)}
                                                    className="px-3 py-2 rounded-lg bg-background border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                                                >
                                                    <option value="">Select Branch</option>
                                                    <option value="Computer Science Engineering">Computer Science Engineering</option>
                                                    <option value="Information Technology">Information Technology</option>
                                                    <option value="Electronics & Communication Engineering">Electronics & Communication Engineering</option>
                                                    <option value="Electrical Engineering">Electrical Engineering</option>
                                                    <option value="Mechanical Engineering">Mechanical Engineering</option>
                                                    <option value="Civil Engineering">Civil Engineering</option>
                                                    <option value="Chemical Engineering">Chemical Engineering</option>
                                                    <option value="Biotechnology">Biotechnology</option>
                                                    <option value="Data Science">Data Science</option>
                                                    <option value="Artificial Intelligence & Machine Learning">Artificial Intelligence & Machine Learning</option>
                                                    <option value="Cybersecurity">Cybersecurity</option>
                                                    <option value="Cloud Computing">Cloud Computing</option>
                                                    <option value="Internet of Things">Internet of Things</option>
                                                    <option value="Other">Other</option>
                                                </select>

                                                {/* Graduation Year */}
                                                <input
                                                    type="number"
                                                    value={graduationYear}
                                                    onChange={(e) => setGraduationYear(e.target.value)}
                                                    placeholder="Graduation Year"
                                                    className="px-3 py-2 rounded-lg bg-background border border-border text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                                                />

                                                {/* Buttons */}
                                                <div className="flex gap-2">
                                                    <Button size="sm" onClick={saveCollege} disabled={savingCollege}>
                                                        {savingCollege ? "Saving..." : "Save"}
                                                    </Button>

                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => {
                                                            setEditingCollege(false);
                                                            setCollege(profile?.college || null);
                                                            setBranch(profile?.branch || "");
                                                            setGraduationYear(profile?.graduationYear || "");
                                                        }}
                                                    >
                                                        Cancel
                                                    </Button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Right: Analyze button + last updated */}
                            <div className="flex flex-col items-start md:items-end gap-2 flex-shrink-0">
                                <Button
                                    variant="gradient"
                                    icon={isAnalyzing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <PlayCircle className="w-4 h-4" />}
                                    onClick={handleAnalyze}
                                    disabled={loading || isAnalyzing}
                                >
                                    {loading ? "Starting…" : isAnalyzing ? "Analyzing…" : metrics ? "Re-analyze" : "Analyze Profile"}
                                </Button>
                                {updatedAt && (
                                    <span className="text-xs text-muted-foreground">
                                        Updated {new Date(updatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                                    </span>
                                )}
                                {isAnalyzing && (
                                    <span className="text-xs text-primary animate-pulse">
                                        Analysis running…
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* ─── CONNECTION REQUESTS ─── */}
                {(connectionsLoading || pendingConnections.length > 0) && (
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-base">
                                    <MessageSquare className="w-4 h-4 text-primary" /> Incoming Connection Requests
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {connectionsLoading && (
                                    <p className="text-sm text-muted-foreground">Loading requests...</p>
                                )}

                                {!connectionsLoading && pendingConnections.length === 0 && (
                                    <p className="text-sm text-muted-foreground">No pending connection requests.</p>
                                )}

                                {pendingConnections.map((item) => (
                                    <div key={item._id} className="rounded-xl border border-border p-3 space-y-3">
                                        <div className="flex items-center gap-3">
                                            <Avatar src={item.requester?.avatarUrl} name={item.requester?.name || item.requester?.username} size="sm" />
                                            <div className="min-w-0 flex-1">
                                                <p className="text-sm font-medium truncate">{item.requester?.name || item.requester?.username}</p>
                                                <p className="text-xs text-muted-foreground truncate">@{item.requester?.username}</p>
                                            </div>
                                            <Link to={`/profile/${item.requester?.username}`} className="text-xs text-primary hover:underline">
                                                View profile
                                            </Link>
                                        </div>

                                        {item.note && <p className="text-xs text-muted-foreground whitespace-pre-wrap break-words">{item.note}</p>}

                                        <div className="flex flex-wrap gap-2">
                                            <Button
                                                size="sm"
                                                loading={connectionActioningId === item._id}
                                                onClick={() => acceptConnection(item._id)}
                                            >
                                                Accept
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                disabled={connectionActioningId === item._id}
                                                onClick={() => declineConnection(item._id)}
                                            >
                                                Decline
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* ─── EMPTY STATE ─── */}
                {!analysisLoading && !metrics && !isAnalyzing && (
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-24 text-center">
                        <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                        <h2 className="text-xl font-semibold mb-2">No analysis yet</h2>
                        <p className="text-muted-foreground mb-6 max-w-sm mx-auto text-sm">
                            Run your first analysis to see your developer score, skills, and insights.
                        </p>
                        <Button variant="gradient" icon={<PlayCircle className="w-4 h-4" />} onClick={handleAnalyze} disabled={loading}>
                            {loading ? "Starting…" : "Analyze Profile"}
                        </Button>
                    </div>
                )}

                {/* ─── ANALYZING STATE ─── */}
                {(analysisLoading || isAnalyzing) && !metrics && (
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-24 text-center">
                        <RefreshCw className="w-10 h-10 text-primary mx-auto mb-4 animate-spin" />
                        <h2 className="text-lg font-semibold mb-1">
                            {analysisLoading ? "Loading your dashboard…" : "Analyzing your GitHub profile…"}
                        </h2>
                        <p className="text-sm text-muted-foreground">
                            {analysisLoading ? "Fetching your latest analysis data" : "This takes about 30–60 seconds"}
                        </p>
                    </div>
                )}

                {/* ─── MAIN CONTENT (only when metrics exist) ─── */}
                {metrics && (
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">

                        {/* ── SCORE + STATS ROW ── */}
                        <motion.div {...fadeUp} className="grid grid-cols-1 lg:grid-cols-4 gap-6">

                            {/* Score card */}
                            <Card className="lg:col-span-1 flex flex-col items-center justify-center py-6">
                                <p className="text-sm font-medium text-muted-foreground mb-3">Developer Score</p>
                                <ScoreCircle score={overallScore} />
                                <p className="text-xs text-muted-foreground mt-3 text-center">
                                    {overallScore >= 75 ? "Excellent" : overallScore >= 50 ? "Good" : "Developing"}
                                </p>
                            </Card>

                            {/* Stats grid */}
                            <div className="lg:col-span-3 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                                <StatCard icon={<Code2 className="w-4 h-4" />} label="Repositories" value={metrics.repoCount} />
                                <StatCard icon={<Star className="w-4 h-4" />} label="Total Stars" value={metrics.totalStars} color="text-yellow-500" />
                                <StatCard icon={<GitFork className="w-4 h-4" />} label="Forks" value={metrics.totalForks} />
                                <StatCard icon={<Activity className="w-4 h-4" />} label="Commits (6M)" value={metrics.commitCount6Months} color="text-green-500" />
                                <StatCard icon={<Calendar className="w-4 h-4" />} label="Active Weeks" value={metrics.activeWeeks} />
                                <StatCard icon={<Flame className="w-4 h-4" />} label="Longest Streak" value={`${metrics.longestStreak}d`} color="text-orange-500" />
                                <StatCard icon={<GitPullRequest className="w-4 h-4" />} label="Pull Requests" value={metrics.prCount} />
                                <StatCard icon={<GitMerge className="w-4 h-4" />} label="Merged PRs" value={metrics.mergedPRCount} color="text-purple-500" />
                                <StatCard icon={<GitBranch className="w-4 h-4" />} label="External PRs" value={metrics.externalPRs} />
                                <StatCard icon={<AlertCircle className="w-4 h-4" />} label="Issues" value={metrics.issueCount} />
                                <StatCard icon={<Eye className="w-4 h-4" />} label="Reviews Given" value={metrics.reviewsGiven ?? 0} color="text-blue-500" />
                                <StatCard icon={<MessageSquare className="w-4 h-4" />} label="Review Comments" value={metrics.reviewComments ?? 0} />
                            </div>
                        </motion.div>

                        {/* ── CODE REVIEW SECTION ── */}
                        {(metrics.reviewsGiven > 0 || metrics.approvals > 0) && (
                            <motion.div
                                initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }} transition={{ duration: 0.4 }}
                            >
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Eye className="w-4 h-4 text-primary" /> Code Review Activity
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                            <div className="text-center p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
                                                <div className="text-2xl font-bold font-mono text-blue-500">{metrics.reviewsGiven ?? 0}</div>
                                                <div className="text-xs text-muted-foreground mt-1">Reviews Given</div>
                                            </div>
                                            <div className="text-center p-4 rounded-xl bg-green-500/10 border border-green-500/20">
                                                <div className="text-2xl font-bold font-mono text-green-500">{metrics.approvals ?? 0}</div>
                                                <div className="text-xs text-muted-foreground mt-1">Approvals</div>
                                            </div>
                                            <div className="text-center p-4 rounded-xl bg-orange-500/10 border border-orange-500/20">
                                                <div className="text-2xl font-bold font-mono text-orange-500">{metrics.changesRequested ?? 0}</div>
                                                <div className="text-xs text-muted-foreground mt-1">Changes Requested</div>
                                            </div>
                                            <div className="text-center p-4 rounded-xl bg-primary/10 border border-primary/20">
                                                <div className="text-2xl font-bold font-mono text-primary">{metrics.reviewComments ?? 0}</div>
                                                <div className="text-xs text-muted-foreground mt-1">Review Comments</div>
                                            </div>
                                        </div>
                                        {metrics.reviewsGiven > 0 && (
                                            <p className="text-xs text-muted-foreground mt-4 text-center">
                                                Based on your last 12 months of GitHub activity
                                            </p>
                                        )}
                                    </CardContent>
                                </Card>
                            </motion.div>
                        )}

                        {/* ── MAIN TWO-COLUMN GRID ── */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

                            {/* LEFT: Activity + Languages */}
                            <div className="lg:col-span-2 space-y-6">

                                {/* Activity chart */}
                                <motion.div
                                    initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }} transition={{ duration: 0.4 }}
                                >
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <Activity className="w-4 h-4 text-primary" /> Contribution Activity
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="flex items-end gap-2 h-40">
                                                {monthlyCommits.map((m, i) => {
                                                    const h = m.commits === 0 ? 0 : Math.max((m.commits / maxCommits) * 140, 8);
                                                    return (
                                                        <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
                                                            <div className="relative w-full flex items-end justify-center">
                                                                <span className="absolute -top-6 text-xs bg-foreground text-background px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                                                    {m.commits} commits
                                                                </span>
                                                                <motion.div
                                                                    initial={{ height: 0 }}
                                                                    animate={{ height: h }}
                                                                    transition={{ duration: 0.6, delay: i * 0.08 }}
                                                                    className="w-full rounded-t-md bg-gradient-to-t from-primary to-primary/60"
                                                                />
                                                            </div>
                                                            <span className="text-xs text-muted-foreground">{m.label}</span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                            <p className="text-center text-sm text-muted-foreground mt-4">
                                                <span className="font-bold font-mono text-foreground">{metrics.commitCount6Months}</span> commits in the last 6 months
                                            </p>
                                        </CardContent>
                                    </Card>
                                </motion.div>

                                {/* Top Languages */}
                                <motion.div
                                    initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }} transition={{ duration: 0.4 }}
                                >
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <Code2 className="w-4 h-4 text-primary" /> Top Languages
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-3">
                                                {topLanguages.map(lang => (
                                                    <div key={lang.name}>
                                                        <div className="flex justify-between text-sm mb-1">
                                                            <div className="flex items-center gap-2">
                                                                <span
                                                                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                                                                    style={{ backgroundColor: LANGUAGE_COLORS[lang.name.toLowerCase()] || "#6366f1" }}
                                                                />
                                                                <span className="font-medium">{lang.name}</span>
                                                            </div>
                                                            <span className="text-muted-foreground font-mono">{lang.percent}%</span>
                                                        </div>
                                                        <ProgressBar
                                                            value={lang.percent}
                                                            color={LANGUAGE_COLORS[lang.name.toLowerCase()] || "#6366f1"}
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>

                                {/* LeetCode Section */}
                                {shouldRenderLeetcodeSection && (
                                    <LeetcodeSection lc={lc} lcScore={lcScore} topAlgoTags={topAlgoTags} />
                                )}
                            </div>

                            {/* RIGHT: Score breakdown + Skills + Quality + Badges */}
                            <div className="space-y-6">

                                {/* Score breakdown */}
                                <motion.div
                                    initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }} transition={{ duration: 0.4 }}
                                >
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <BarChart3 className="w-4 h-4 text-primary" /> Score Breakdown
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-2.5">
                                                {scoreBreakdown.map(({ key, label, value }) => (
                                                    <div key={key}>
                                                        <div className="flex justify-between text-xs mb-1">
                                                            <span className="text-muted-foreground">{label}</span>
                                                            <span className="font-mono font-medium">{value}</span>
                                                        </div>
                                                        <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                                                            <motion.div
                                                                initial={{ width: 0 }}
                                                                whileInView={{ width: `${value}%` }}
                                                                viewport={{ once: true }}
                                                                transition={{ duration: 0.6, ease: "easeOut" }}
                                                                className="h-full rounded-full bg-gradient-to-r from-primary to-accent"
                                                            />
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>

                                {/* Skills */}
                                <motion.div
                                    initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }} transition={{ duration: 0.4 }}
                                >
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <Zap className="w-4 h-4 text-primary" /> Skills
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="flex flex-wrap gap-2">
                                                {(() => {
                                                    const seen = new Set();
                                                    return (metrics.skills || []).filter(skill => {
                                                        const k = SKILL_ICON_KEY(skill);
                                                        if (seen.has(k)) return false;
                                                        seen.add(k);
                                                        return true;
                                                    });
                                                })().map(skill => {
                                                    const key = SKILL_ICON_KEY(skill);
                                                    return (
                                                        <div key={key}
                                                            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-border text-xs hover:border-primary/40 transition-colors">
                                                            {TECH_ICONS[key] && (
                                                                <img src={TECH_ICONS[key]} className="w-3.5 h-3.5" alt={skill} />
                                                            )}
                                                            <span>{skill}</span>
                                                        </div>
                                                    );
                                                })}
                                                {/* LeetCode languages — deduplicated against GitHub skills by normalized key */}
                                                {(() => {
                                                    const ghKeys = new Set((metrics.skills || []).map(s => SKILL_ICON_KEY(s)));
                                                    return (lc?.languages || [])
                                                        .filter(l => l.problemsSolved > 0 && !ghKeys.has(SKILL_ICON_KEY(l.languageName)))
                                                        .sort((a, b) => b.problemsSolved - a.problemsSolved);
                                                })().map(l => {
                                                    const key = SKILL_ICON_KEY(l.languageName);
                                                    return (
                                                        <div key={`lc-${l.languageName}`}
                                                            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-border text-xs hover:border-primary/40 transition-colors">
                                                            {TECH_ICONS[key] && (
                                                                <img src={TECH_ICONS[key]} className="w-3.5 h-3.5" alt={l.languageName} />
                                                            )}
                                                            <span>{l.languageName}</span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>

                                {/* Quality Indicators */}
                                <motion.div
                                    initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }} transition={{ duration: 0.4 }}
                                >
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <Shield className="w-4 h-4 text-primary" /> Project Quality
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-2">
                                                {qualityItems.map(item => (
                                                    <div key={item.label} className="flex items-center justify-between py-1.5 border-b border-border last:border-0">
                                                        <div className="flex items-center gap-2 text-sm">
                                                            {item.count > 0
                                                                ? <CheckCircle2 className="w-4 h-4 text-green-500" />
                                                                : <XCircle className="w-4 h-4 text-muted-foreground" />
                                                            }
                                                            <span className={item.count > 0 ? "" : "text-muted-foreground"}>{item.label}</span>
                                                        </div>
                                                        {item.count > 0 && (
                                                            <span className="text-xs text-muted-foreground font-mono">{item.count} repos</span>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>

                            </div>
                        </div>

                        {/* ── BADGES + PUBLIC PROFILE ROW ── */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            {badges.length > 0 && (
                                <motion.div
                                    initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }} transition={{ duration: 0.4 }}
                                >
                                    <Card className="h-full">
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <Award className="w-4 h-4 text-yellow-500" /> Badges
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="flex flex-wrap gap-2">
                                                {badges.map((badge, i) => (
                                                    <div key={i} className="relative group">
                                                        <button
                                                            type="button"
                                                            title={getBadgeDescription(badge)}
                                                            className="px-3 py-1.5 rounded-full text-xs font-medium bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 text-primary cursor-help"
                                                        >
                                                            {formatBadgeLabel(badge)}
                                                        </button>
                                                        <div className="pointer-events-none absolute left-1/2 top-full z-20 mt-2 w-56 -translate-x-1/2 rounded-lg border border-border bg-card p-2.5 text-xs text-muted-foreground opacity-0 shadow-lg transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
                                                            <p className="font-medium text-foreground mb-1">{formatBadgeLabel(badge)}</p>
                                                            <p>{getBadgeDescription(badge)}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            )}

                            <motion.div
                                initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }} transition={{ duration: 0.4 }}
                                className={badges.length === 0 ? "sm:col-span-2 max-w-md" : ""}
                            >
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <ExternalLink className="w-4 h-4 text-primary" /> Public Profile
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        <div className="flex items-center gap-2 bg-secondary rounded-lg p-2.5">
                                            <code className="text-xs flex-1 truncate text-muted-foreground">
                                                {window.location.origin}/profile/{username}
                                            </code>
                                            <button
                                                onClick={copyProfileUrl}
                                                className="text-muted-foreground hover:text-primary transition-colors flex-shrink-0"
                                            >
                                                {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                                            </button>
                                        </div>
                                        <a
                                            href={`/profile/${username}`}
                                            target="_blank" rel="noopener noreferrer"
                                            className="flex items-center gap-1.5 text-xs text-primary hover:underline"
                                        >
                                            <ExternalLink className="w-3 h-3" /> View public profile
                                        </a>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        </div>

                        {/* ── SKILL RADAR ── */}
                        <motion.div
                            initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }} transition={{ duration: 0.4 }}
                            className="max-w-3xl mx-auto w-full"
                        >
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Activity className="w-4 h-4 text-primary" /> Skill Profile
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="h-64">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <RadarChart data={radarData}>
                                            <PolarGrid stroke="hsl(var(--border))" />
                                            <PolarAngleAxis dataKey="metric" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                                            <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
                                            <Tooltip
                                                contentStyle={{
                                                    backgroundColor: "hsl(var(--card))",
                                                    border: "1px solid hsl(var(--border))",
                                                    borderRadius: "8px",
                                                    fontSize: "12px"
                                                }}
                                            />
                                            <Radar
                                                name="Score" dataKey="value"
                                                stroke="#6366f1" fill="#6366f1" fillOpacity={0.25}
                                                strokeWidth={2}
                                            />
                                        </RadarChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>
                        </motion.div>

                    </div>
                )}
            </div>
        </Layout>
    );
};

