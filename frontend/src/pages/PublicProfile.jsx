import React, { useState, useEffect, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";
import {
    Code2, Star, GitFork, GitPullRequest, GitMerge, Flame,
    Calendar, Activity, ExternalLink, AlertCircle, Trophy,
    Eye, MessageSquare, Award, Shield, Zap, CheckCircle2,
    XCircle, FileText, BookOpen, GitBranch, BarChart3
} from "lucide-react";
import {
    RadarChart, Radar, PolarGrid, PolarAngleAxis,
    PolarRadiusAxis, ResponsiveContainer, Tooltip
} from "recharts";
import { Layout } from "../components/layout/Layout";
import { Avatar } from "../components/ui/Avatar";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/Card";
import ProgressBar from "../components/ui/ProgressBar";

const API = import.meta.env.VITE_API_URL;

const LANGUAGE_COLORS = {
    javascript: "#f7df1e", typescript: "#3178c6", python: "#3776ab",
    java: "#f89820", go: "#00ADD8", rust: "#dea584", c: "#A8B9CC",
    "c++": "#00599C", cpp: "#00599C", "c#": "#239120", csharp: "#239120",
    php: "#777BB4", ruby: "#CC342D", swift: "#FA7343", kotlin: "#7F52FF",
    dart: "#0175C2", shell: "#89e051", html: "#e34c26", css: "#264de4",
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
    docker: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/docker/docker-original.svg",
    go: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/go/go-original-wordmark.svg",
    rust: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/rust/rust-plain.svg",
    mongodb: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mongodb/mongodb-original.svg",
    postgresql: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postgresql/postgresql-original.svg",
    redis: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/redis/redis-original.svg",
    aws: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/amazonwebservices/amazonwebservices-original-wordmark.svg",
    firebase: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/firebase/firebase-plain.svg",
    kubernetes: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/kubernetes/kubernetes-plain.svg",
};

const LC_LANG_KEY = (name) => {
    const map = {
        "python3": "python", "python2": "python",
        "c++": "cpp", "c#": "csharp",
        "golang": "go",
    };
    const lower = name.toLowerCase();
    return map[lower] ?? lower;
};

function ScoreCircle({ score }) {
    const radius = 48;
    const circumference = 2 * Math.PI * radius;
    const progress = (Math.min(score, 100) / 100) * circumference;
    const color = score >= 75 ? "#22c55e" : score >= 50 ? "#f59e0b" : "#6366f1";

    return (
        <div className="relative inline-flex items-center justify-center w-28 h-28">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 112 112">
                <circle cx="56" cy="56" r={radius} stroke="currentColor"
                    strokeWidth="8" fill="none" className="text-border" />
                <motion.circle
                    cx="56" cy="56" r={radius} stroke={color}
                    strokeWidth="8" fill="none" strokeLinecap="round"
                    initial={{ strokeDasharray: `0 ${circumference}` }}
                    animate={{ strokeDasharray: `${progress} ${circumference}` }}
                    transition={{ duration: 1.4, ease: "easeOut", delay: 0.3 }}
                />
            </svg>
            <div className="absolute text-center">
                <span className="text-2xl font-bold font-mono">{Math.round(score)}</span>
                <span className="block text-xs text-muted-foreground">/100</span>
            </div>
        </div>
    );
}

function StatItem({ icon, label, value, color = "text-primary" }) {
    return (
        <div className="flex flex-col items-center gap-1 p-3 rounded-xl bg-secondary">
            <span className={color}>{icon}</span>
            <span className="text-lg font-bold font-mono">{value ?? "—"}</span>
            <span className="text-xs text-muted-foreground text-center">{label}</span>
        </div>
    );
}

export default function PublicProfile() {
    const { username } = useParams();
    const [data, setData] = useState(null);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);

    useEffect(() => {
        if (!username) return;
        Promise.all([
            axios.get(`${API}/api/analyze/status/${username}`).catch(() => null),
            axios.get(`${API}/api/profile/${username}`).catch(() => null),
        ]).then(([analysisRes, profileRes]) => {
            if (!analysisRes?.data || analysisRes.data.status === "failed") {
                setNotFound(true);
            } else {
                setData(analysisRes.data);
            }
            if (profileRes?.data) setProfile(profileRes.data);
        }).finally(() => setLoading(false));
    }, [username]);

    const metrics = data?.rawMetrics;
    const lc = data?.leetcodeMetrics;
    const lcScore = data?.leetcodeScore || 0;
    const badges = data?.badges || [];
    const overallScore = data?.overallScore || 0;

    const topLanguages = useMemo(() => {
        if (!metrics?.languagePercentages) return [];
        return Object.entries(metrics.languagePercentages)
            .map(([name, value]) => ({ name, percent: Math.round(value * 100) }))
            .sort((a, b) => b.percent - a.percent)
            .slice(0, 5);
    }, [metrics]);

    const topAlgoTags = useMemo(() => {
        if (!lc?.algorithms) return [];
        return [...(lc.algorithms.advanced || []), ...(lc.algorithms.intermediate || [])]
            .sort((a, b) => b.problemsSolved - a.problemsSolved)
            .slice(0, 6);
    }, [lc]);

    const radarData = useMemo(() => {
        const s = data?.scoreBreakdown?.normalizedScores || {};
        return [
            { metric: "Activity",    value: Math.round(s.activityScore || 0) },
            { metric: "Consistency", value: Math.round(s.consistencyScore || 0) },
            { metric: "Collab",      value: Math.round(s.collaborationScore || 0) },
            { metric: "Reviews",     value: Math.round(s.codeReviewScore || 0) },
            { metric: "Quality",     value: Math.round(s.projectQualityScore || 0) },
            { metric: "Languages",   value: Math.round(s.languageDiversityScore || 0) },
            { metric: "Frameworks",  value: Math.round(s.frameworkScore || 0) },
            { metric: "Stars",       value: Math.round(s.starScore || 0) },
        ];
    }, [data]);

    const qualityItems = useMemo(() => {
        const q = metrics?.qualityIndicators || {};
        return [
            { icon: <FileText className="w-3.5 h-3.5" />, label: "README",  count: q.readme  || 0 },
            { icon: <Zap className="w-3.5 h-3.5" />,      label: "CI/CD",   count: q.ci      || 0 },
            { icon: <Shield className="w-3.5 h-3.5" />,   label: "Tests",   count: q.tests   || 0 },
            { icon: <BookOpen className="w-3.5 h-3.5" />, label: "License", count: q.license || 0 },
        ];
    }, [metrics]);

    if (loading) {
        return (
            <Layout showFooter={false}>
                <div className="flex items-center justify-center min-h-screen">
                    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
            </Layout>
        );
    }

    if (notFound || !data) {
        return (
            <Layout showFooter={false}>
                <div className="max-w-lg mx-auto px-4 py-32 text-center">
                    <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h1 className="text-xl font-bold mb-2">Profile not found</h1>
                    <p className="text-sm text-muted-foreground mb-6">
                        <strong>{username}</strong> hasn't run a SkillHire analysis yet, or doesn't exist.
                    </p>
                    <Link to="/leaderboard" className="text-primary text-sm hover:underline">
                        Browse the leaderboard →
                    </Link>
                </div>
            </Layout>
        );
    }

    const displayName = profile?.name || username;
    const avatarUrl = profile?.avatarUrl;
    const bio = profile?.bio;
    const updatedAt = data?.updatedAt;

    return (
        <Layout showFooter={false}>
            <div className="min-h-screen bg-background pb-16">

                {/* Profile header */}
                <div className="border-b border-border bg-card/50 backdrop-blur-sm">
                    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
                        <div className="flex flex-col sm:flex-row items-start gap-6">
                            <Avatar src={avatarUrl} name={displayName} size="xl" />
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-3 flex-wrap">
                                    <h1 className="text-2xl font-bold">{displayName}</h1>
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
                                    href={`https://github.com/${username}`}
                                    target="_blank" rel="noopener noreferrer"
                                    className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1 mt-0.5 w-fit"
                                >
                                    @{username} <ExternalLink className="w-3 h-3" />
                                </a>
                                {bio && <p className="text-sm text-muted-foreground mt-1.5 max-w-lg">{bio}</p>}
                                {updatedAt && (
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Last analyzed {new Date(updatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                                    </p>
                                )}
                            </div>

                            {/* Score */}
                            <div className="flex-shrink-0 flex flex-col items-center">
                                <ScoreCircle score={overallScore} />
                                <p className="text-xs text-muted-foreground mt-1">SkillHire Score</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">

                    {/* Stats */}
                    <motion.div
                        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.35 }}
                        className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3"
                    >
                        <StatItem icon={<Code2 className="w-4 h-4" />} label="Repos" value={metrics?.repoCount} />
                        <StatItem icon={<Star className="w-4 h-4" />} label="Stars" value={metrics?.totalStars} color="text-yellow-500" />
                        <StatItem icon={<GitFork className="w-4 h-4" />} label="Forks" value={metrics?.totalForks} />
                        <StatItem icon={<Activity className="w-4 h-4" />} label="Commits 6M" value={metrics?.commitCount6Months} color="text-green-500" />
                        <StatItem icon={<GitPullRequest className="w-4 h-4" />} label="PRs" value={metrics?.prCount} />
                        <StatItem icon={<Flame className="w-4 h-4" />} label="Streak" value={`${metrics?.longestStreak ?? 0}d`} color="text-orange-500" />
                    </motion.div>

                    {/* Two column: Languages + Skills | LeetCode + Quality */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                        {/* Languages */}
                        <motion.div
                            initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }} transition={{ duration: 0.35 }}
                        >
                            <Card className="h-full">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-sm">
                                        <Code2 className="w-4 h-4 text-primary" /> Top Languages
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        {topLanguages.map(lang => (
                                            <div key={lang.name}>
                                                <div className="flex justify-between text-sm mb-1">
                                                    <div className="flex items-center gap-2">
                                                        <span className="w-2.5 h-2.5 rounded-full"
                                                            style={{ backgroundColor: LANGUAGE_COLORS[lang.name.toLowerCase()] || "#6366f1" }} />
                                                        <span className="font-medium">{lang.name}</span>
                                                    </div>
                                                    <span className="text-muted-foreground font-mono">{lang.percent}%</span>
                                                </div>
                                                <ProgressBar value={lang.percent}
                                                    color={LANGUAGE_COLORS[lang.name.toLowerCase()] || "#6366f1"} />
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>

                        {/* Skills + Quality */}
                        <div className="space-y-6">
                            <motion.div
                                initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }} transition={{ duration: 0.35 }}
                            >
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2 text-sm">
                                            <Zap className="w-4 h-4 text-primary" /> Skills
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex flex-wrap gap-2">
                                            {(metrics?.skills || []).map(skill => (
                                                <div key={skill}
                                                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-border text-xs">
                                                    {TECH_ICONS[skill.toLowerCase()] && (
                                                        <img src={TECH_ICONS[skill.toLowerCase()]} className="w-3.5 h-3.5" alt={skill} />
                                                    )}
                                                    <span>{skill}</span>
                                                </div>
                                            ))}
                                            {/* LeetCode languages — deduplicated against GitHub skills */}
                                            {(lc?.languages || [])
                                                .filter(l => l.problemsSolved > 0 &&
                                                    !(metrics?.skills || []).some(s => s.toLowerCase() === l.languageName.toLowerCase()))
                                                .sort((a, b) => b.problemsSolved - a.problemsSolved)
                                                .map(l => {
                                                    const key = LC_LANG_KEY(l.languageName);
                                                    return (
                                                        <div key={`lc-${l.languageName}`}
                                                            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-border text-xs">
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

                            <motion.div
                                initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }} transition={{ duration: 0.35 }}
                            >
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2 text-sm">
                                            <Shield className="w-4 h-4 text-primary" /> Project Quality
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid grid-cols-2 gap-2">
                                            {qualityItems.map(item => (
                                                <div key={item.label}
                                                    className="flex items-center gap-2 text-sm">
                                                    {item.count > 0
                                                        ? <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                                                        : <XCircle className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                                                    }
                                                    <span className={item.count > 0 ? "" : "text-muted-foreground"}>
                                                        {item.label}
                                                    </span>
                                                    {item.count > 0 && (
                                                        <span className="text-xs text-muted-foreground font-mono ml-auto">{item.count}</span>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        </div>
                    </div>

                    {/* LeetCode */}
                    {lc && lc.solved?.total > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }} transition={{ duration: 0.35 }}
                        >
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center justify-between text-sm">
                                        <span className="flex items-center gap-2">
                                            <Trophy className="w-4 h-4 text-yellow-500" /> LeetCode
                                        </span>
                                        <span className="font-normal text-muted-foreground">
                                            Score <span className="font-bold font-mono text-foreground">{lcScore}</span>/100
                                        </span>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="grid grid-cols-4 gap-2">
                                        {[
                                            { label: "Total",  value: lc.solved.total,  cls: "bg-secondary text-foreground" },
                                            { label: "Easy",   value: lc.solved.easy,   cls: "bg-green-500/10 border border-green-500/20 text-green-500" },
                                            { label: "Medium", value: lc.solved.medium, cls: "bg-yellow-500/10 border border-yellow-500/20 text-yellow-500" },
                                            { label: "Hard",   value: lc.solved.hard,   cls: "bg-red-500/10 border border-red-500/20 text-red-500" },
                                        ].map(d => (
                                            <div key={d.label} className={`text-center py-2.5 rounded-lg ${d.cls}`}>
                                                <div className="text-lg font-bold font-mono">{d.value}</div>
                                                <div className="text-xs text-muted-foreground">{d.label}</div>
                                            </div>
                                        ))}
                                    </div>
                                    {lc.contest?.rating > 0 && (
                                        <div className="flex rounded-lg bg-secondary overflow-hidden divide-x divide-border">
                                            <div className="flex-1 text-center py-2.5">
                                                <div className="text-xs text-muted-foreground">Rating</div>
                                                <div className="text-base font-bold font-mono">{Math.round(lc.contest.rating)}</div>
                                            </div>
                                            {lc.contest.globalRank && (
                                                <div className="flex-1 text-center py-2.5">
                                                    <div className="text-xs text-muted-foreground">Global Rank</div>
                                                    <div className="text-base font-bold font-mono">#{lc.contest.globalRank.toLocaleString()}</div>
                                                </div>
                                            )}
                                            {lc.contest.contestsAttended > 0 && (
                                                <div className="flex-1 text-center py-2.5">
                                                    <div className="text-xs text-muted-foreground">Contests</div>
                                                    <div className="text-base font-bold font-mono">{lc.contest.contestsAttended}</div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                    {topAlgoTags.length > 0 && (
                                        <div className="flex flex-wrap gap-2 pt-1">
                                            {topAlgoTags.map(tag => (
                                                <span key={tag.tagName}
                                                    className="px-2 py-1 rounded-lg text-xs bg-primary/10 text-primary border border-primary/20">
                                                    {tag.tagName} · {tag.problemsSolved}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </motion.div>
                    )}

                    {/* Code Review */}
                    {(metrics?.reviewsGiven > 0 || metrics?.approvals > 0) && (
                        <motion.div
                            initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }} transition={{ duration: 0.35 }}
                        >
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-sm">
                                        <Eye className="w-4 h-4 text-primary" /> Code Review Activity
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                        {[
                                            { label: "Reviews Given",     value: metrics.reviewsGiven  ?? 0, cls: "bg-blue-500/10 border-blue-500/20 text-blue-500" },
                                            { label: "Approvals",         value: metrics.approvals     ?? 0, cls: "bg-green-500/10 border-green-500/20 text-green-500" },
                                            { label: "Changes Requested", value: metrics.changesRequested ?? 0, cls: "bg-orange-500/10 border-orange-500/20 text-orange-500" },
                                            { label: "Review Comments",   value: metrics.reviewComments ?? 0, cls: "bg-primary/10 border-primary/20 text-primary" },
                                        ].map(d => (
                                            <div key={d.label} className={`text-center p-3 rounded-xl border ${d.cls}`}>
                                                <div className={`text-xl font-bold font-mono`}>{d.value}</div>
                                                <div className="text-xs text-muted-foreground mt-0.5">{d.label}</div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    )}

                    {/* Badges */}
                    {badges.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }} transition={{ duration: 0.35 }}
                        >
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-sm">
                                        <Award className="w-4 h-4 text-yellow-500" /> Badges
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex flex-wrap gap-2">
                                        {badges.map((badge, i) => (
                                            <span key={i}
                                                className="px-3 py-1.5 rounded-full text-xs font-medium bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 text-primary">
                                                {badge.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase())}
                                            </span>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    )}

                    {/* Skill radar */}
                    <motion.div
                        initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }} transition={{ duration: 0.35 }}
                        className="max-w-2xl mx-auto w-full"
                    >
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-sm">
                                    <Activity className="w-4 h-4 text-primary" /> Skill Profile
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="h-60">
                                <ResponsiveContainer width="100%" height="100%">
                                    <RadarChart data={radarData}>
                                        <PolarGrid stroke="hsl(var(--border))" />
                                        <PolarAngleAxis dataKey="metric"
                                            tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                                        <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
                                        <Tooltip contentStyle={{
                                            backgroundColor: "hsl(var(--card))",
                                            border: "1px solid hsl(var(--border))",
                                            borderRadius: "8px", fontSize: "12px"
                                        }} />
                                        <Radar name="Score" dataKey="value"
                                            stroke="#6366f1" fill="#6366f1" fillOpacity={0.25} strokeWidth={2} />
                                    </RadarChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Footer link */}
                    <div className="text-center pt-4">
                        <Link to="/" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                            Powered by <span className="font-semibold text-foreground">SkillHire</span>
                        </Link>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
