import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import {
    Code2,
    Star,
    GitFork,
    GitPullRequest,
    GitMerge,
    Flame,
    Calendar,
    Activity,
    ExternalLink,
    AlertCircle,
    PlayCircle,
    Pencil
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { Layout } from "../components/layout/Layout";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Avatar } from "../components/ui/Avatar";
import { StatCard } from "../components/ui/Stats";
import { PageLoader } from "../components/ui/Loader";
import ProgressBar from "../components/ui/ProgressBar";

const API = import.meta.env.VITE_API_URL;

export const DeveloperDashboard = () => {

    const { profile } = useAuth();
    const username = profile?.username;

    const [metrics, setMetrics] = useState(null);
    const [badges, setBadges] = useState([]);
    const [status, setStatus] = useState(null);
    const [updatedAt, setUpdatedAt] = useState(null);

    const [loading, setLoading] = useState(false);
    const [polling, setPolling] = useState(false);

    const [editingBio, setEditingBio] = useState(false);
    const [bio, setBio] = useState(profile.bio || "");
    const [savingBio, setSavingBio] = useState(false);

    if (!profile) return <PageLoader />;

    // ---------------- FETCH EXISTING ANALYSIS ----------------

    useEffect(() => {
        if (!username) return;

        const fetchAnalysis = async () => {
            try {
                const res = await axios.get(`${API}/api/analyze/status/${username}`);

                if (res.data?.rawMetrics) {
                    setMetrics(res.data.rawMetrics);
                    setBadges(res.data.badges || []);
                    setUpdatedAt(res.data.updatedAt);
                    setStatus(res.data.status);
                }

                if (res.data.status === "processing" || res.data.status === "queued") {
                    setPolling(true);
                }

            } catch (err) {
                console.error(err);
            }
        };
        fetchAnalysis();
    }, [username]);

    //---------------UPDATE BIO---------------
    const saveBio = async () => {
        try {
            setSavingBio(true);
            await axios.put(
                `${API}/api/profile/update`,
                { bio },
                { withCredentials: true }
            );
            setEditingBio(false);

        } catch (err) {
            console.error(err);
        } finally {
            setSavingBio(false);
        }

    };

    // ---------------- ANALYZE BUTTON ----------------
    const handleAnalyze = async () => {
        try {
            setLoading(true);
            await axios.post(
                `${API}/api/analyze`,
                {},
                { withCredentials: true }
            );
            setPolling(true);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // ---------------- POLLING ----------------
    useEffect(() => {
        if (!polling) return;
        const interval = setInterval(async () => {
            const res = await axios.get(`${API}/api/analyze/status/${username}`, {
                withCredentials: true
            });
            setStatus(res.data.status);

            if (res.data.status === "completed") {
                setMetrics(res.data.rawMetrics);
                setBadges(res.data.badges || []);
                setUpdatedAt(res.data.updatedAt);

                setPolling(false);
                clearInterval(interval);
            }
        }, 2000);
        return () => clearInterval(interval);
    }, [polling]);

    // ---------------- MONTHLY COMMITS ----------------
    const monthlyCommits = useMemo(() => {
        const months = [];
        const now = new Date();
        for (let i = 5; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const key = `${d.getFullYear()}-${String(
                d.getMonth() + 1
            ).padStart(2, "0")}`;

            months.push({
                label: d.toLocaleString("default", { month: "short" }),
                commits: metrics?.monthlyCommits?.[key] || 0
            });
        }
        return months;
    }, [metrics]);

    const maxCommits = Math.max(...monthlyCommits.map(m => m.commits), 1);

    // ---------------- TOP LANGUAGES ----------------
    const topLanguages = useMemo(() => {
        if (!metrics?.languagePercentages) return [];
        return Object.entries(metrics.languagePercentages)
            .map(([name, value]) => ({
                name,
                percent: Math.round(value * 100)
            }))
            .sort((a, b) => b.percent - a.percent)
            .slice(0, 5);
    }, [metrics]);

    // ---------------- TECH STACK ----------------

    const techIcons = {
        javascript: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg",
        typescript: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg",
        python: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg",
        react: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg",
        express: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/express/express-original.svg",
        html: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/html5/html5-original.svg",
        css: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/css3/css3-original.svg",
        ejs: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg",
        vercel: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vercel/vercel-original.svg",
        aws: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/amazonwebservices/amazonwebservices-original.svg",
        firebase: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/firebase/firebase-plain.svg",
        kubernetes: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/kubernetes/kubernetes-plain.svg",
        netlify: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/netlify/netlify-original.svg",
    };
    const languageColors = {
        javascript: "#f7df1e",
        typescript: "#3178c6",
        python: "#3776ab",
        java: "#f89820",
        go: "#00ADD8",
        rust: "#dea584",
        c: "#A8B9CC",
        cpp: "#00599C",
        csharp: "#239120",
        php: "#777BB4",
        ruby: "#CC342D",
        swift: "#FA7343",
        kotlin: "#7F52FF",
        dart: "#0175C2",
        shell: "#89e051",
        html: "#e34c26",
        css: "#264de4",
    };

    const techStack = metrics?.skills || [];

    const publicProfileUrl = `${window.location.origin}/profile/${username}`;

    return (
        <Layout showFooter={true}>
            <div className="min-h-screen bg-background">

                {/* HEADER */}
                <div className="gradient-bg-subtle py-10 sm:py-12">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
                                <Avatar
                                    src={profile.avatarUrl}
                                    name={profile.name || profile.username}
                                    size="xl"
                                    className="sm:size-2xl"
                                />
                                <div>
                                    <h1 className="text-2xl sm:text-3xl font-bold">
                                        {profile.name || profile.username}
                                    </h1>
                                    <a
                                        href={`https://github.com/${profile.username}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-sm text-primary hover:underline flex items-center gap-1"
                                    >
                                        @{profile.username}
                                        <ExternalLink className="w-3 h-3" />
                                    </a>
                                    <div className="flex items-start gap-2 mt-1">

                                        {!editingBio ? (

                                            <>
                                                <p className="text-muted-foreground">
                                                    {bio || "Add a short bio about yourself."}
                                                </p>

                                                <button
                                                    onClick={() => setEditingBio(true)}
                                                    className="text-muted-foreground hover:text-primary"
                                                >
                                                    <Pencil className="w-4 h-4" />
                                                </button>
                                            </>

                                        ) : (

                                            <div className="flex flex-col gap-2 w-full">

                                                <textarea
                                                    value={bio}
                                                    onChange={(e) => setBio(e.target.value)}
                                                    className="w-full border rounded-md p-2 text-sm bg-background"
                                                    rows={3}
                                                    placeholder="Write something about yourself..."
                                                />

                                                <div className="flex gap-2">

                                                    <Button
                                                        size="sm"
                                                        onClick={saveBio}
                                                        disabled={savingBio}
                                                    >
                                                        {savingBio ? "Saving..." : "Save"}
                                                    </Button>

                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => {
                                                            setEditingBio(false);
                                                            setBio(profile.bio || "");
                                                        }}
                                                    >
                                                        Cancel
                                                    </Button>

                                                </div>

                                            </div>

                                        )}

                                    </div>
                                    {metrics && (

                                        <div className="flex flex-wrap gap-3 mt-3">

                                            <div className="px-3 py-2 border border-primary/40 bg-primary/10 rounded-lg text-sm">
                                                Primary Language: <b>{metrics.primaryLanguage}</b>
                                            </div>

                                            <div className="px-3 py-2 border border-primary/40 bg-primary/10 rounded-lg text-sm">
                                                Developer: <b>{metrics.developerType}</b>
                                            </div>

                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex flex-col sm:items-end gap-2 w-full sm:w-auto">

                                <Button
                                    variant="gradient"
                                    icon={<PlayCircle />}
                                    onClick={handleAnalyze}
                                    disabled={loading || polling || status === "processing" || status === "queued"}
                                >
                                    {loading
                                        ? "Starting..."
                                        : polling || status === "processing"
                                            ? "Analyzing..."
                                            : "Analyze"}
                                </Button>

                                {updatedAt && (
                                    <span className="text-xs text-muted-foreground">
                                        Last updated: {new Date(updatedAt).toLocaleString()}
                                    </span>
                                )}

                            </div>
                        </div>
                    </div>
                </div>

                {/* METRICS */}

                {metrics && (

                    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">

                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-10">

                            <StatCard icon={<Code2 />} label="Repos" value={metrics.repoCount} />
                            <StatCard icon={<Star />} label="Stars" value={metrics.totalStars} />
                            <StatCard icon={<GitFork />} label="Forks" value={metrics.totalForks} />
                            <StatCard icon={<Activity />} label="Commits (6M)" value={metrics.commitCount6Months} />
                            <StatCard icon={<Calendar />} label="Active Weeks" value={metrics.activeWeeks} />
                            <StatCard icon={<Flame />} label="Streak" value={metrics.longestStreak} />
                            <StatCard icon={<GitPullRequest />} label="PRs" value={metrics.prCount} />
                            <StatCard icon={<GitMerge />} label="Merged PR" value={metrics.mergedPRCount} />
                            <StatCard icon={<ExternalLink />} label="External PR" value={metrics.externalPRs} />
                            <StatCard icon={<AlertCircle />} label="Issues" value={metrics.issueCount} />

                        </div>

                        {/* CHART + SIDE */}

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                            {/* LEFT SIDE */}

                            <div className="lg:col-span-2 space-y-8">

                                {/* CONTRIBUTION ACTIVITY */}

                                <Card className="transition-all duration-200 hover:scale-[1.02] hover:border hover:border-purple-500 hover:shadow-lg">

                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Activity /> Contribution Activity
                                        </CardTitle>
                                    </CardHeader>

                                    <CardContent>

                                        <div className="flex items-end gap-2 sm:gap-4 h-48 sm:h-56 overflow-x-auto">

                                            {monthlyCommits.map((m, i) => {

                                                const height =
                                                    m.commits === 0 ? 0 : Math.max((m.commits / maxCommits) * 180, 10);

                                                return (
                                                    <div key={i} className="flex-1 min-w-[40px] flex flex-col items-center">

                                                        <div className="relative group w-full flex items-end justify-center">

                                                            <span className="absolute -top-6 opacity-0 group-hover:opacity-100 transition text-xs bg-black text-white px-2 py-1 rounded">
                                                                {m.commits}
                                                            </span>

                                                            <motion.div
                                                                initial={{ height: 0 }}
                                                                animate={{ height }}
                                                                transition={{ duration: 0.6 }}
                                                                className="w-full rounded-md bg-gradient-to-t from-blue-500 to-purple-500"
                                                            />

                                                        </div>

                                                        <span className="text-xs mt-2">{m.label}</span>

                                                    </div>
                                                );
                                            })}

                                        </div>

                                        <div className="text-center mt-6">
                                            <p className="text-2xl font-bold">
                                                {metrics.commitCount6Months}
                                            </p>

                                            <p className="text-sm text-muted-foreground">
                                                commits in the last 6 months
                                            </p>
                                        </div>

                                    </CardContent>
                                </Card>

                                {/* TOP LANGUAGES */}

                                <Card className="transition-all duration-200 hover:scale-[1.02] hover:border hover:border-purple-500 hover:shadow-lg">

                                    <CardHeader>
                                        <CardTitle>Top Languages</CardTitle>
                                    </CardHeader>

                                    <CardContent>

                                        <div className="space-y-4">

                                            {topLanguages.map((lang) => (

                                                <div key={lang.name}>

                                                    <div className="flex justify-between text-sm mb-1">
                                                        <span>{lang.name}</span>
                                                        <span>{lang.percent}%</span>
                                                    </div>

                                                    <ProgressBar value={lang.percent} color={languageColors[lang.name.toLowerCase()] || "#6366f1"} />

                                                </div>

                                            ))}

                                        </div>

                                    </CardContent>
                                </Card>

                            </div>

                            {/* RIGHT SIDE */}

                            <div className="space-y-8">

                                {/* PUBLIC PROFILE */}

                                <Card className="transition-all duration-200 hover:scale-[1.02] hover:border hover:border-purple-500 hover:shadow-lg">

                                    <CardHeader>
                                        <CardTitle>Your Public Profile</CardTitle>
                                    </CardHeader>

                                    <CardContent>

                                        <div className="flex items-center gap-2 bg-background/60 p-3 rounded-lg">

                                            <code className="text-sm flex-1 break-all">
                                                {publicProfileUrl}
                                            </code>

                                            <button
                                                onClick={() => navigator.clipboard.writeText(publicProfileUrl)}
                                                className="text-primary"
                                            >
                                                Copy
                                            </button>

                                        </div>

                                    </CardContent>

                                </Card>

                                {/* SKILLS */}

                                <Card className="transition-all duration-200 hover:scale-[1.02] hover:border hover:border-purple-500 hover:shadow-lg">

                                    <CardHeader>
                                        <CardTitle>Skills</CardTitle>
                                    </CardHeader>

                                    <CardContent>

                                        <div className="flex flex-wrap gap-2 sm:gap-3">

                                            {techStack.map(skill => {

                                                const key = skill.toLowerCase();

                                                return (

                                                    <div
                                                        key={skill}
                                                        className="flex items-center gap-2 px-2 sm:px-3 py-1 border border-border rounded-lg text-xs sm:text-sm hover:border-primary/40 hover:scale-105 transition"
                                                    >

                                                        {techIcons[key] && (
                                                            <img
                                                                src={techIcons[key]}
                                                                className="w-4 h-4"
                                                            />
                                                        )}

                                                        <span>{skill}</span>

                                                    </div>
                                                );
                                            })}

                                        </div>

                                    </CardContent>

                                </Card>

                                {/* DEVELOPER SCORE */}

                                <Card className="transition-all duration-200 hover:scale-[1.02] hover:border hover:border-purple-500 hover:shadow-lg">

                                    <CardHeader>
                                        <CardTitle>Developer Score</CardTitle>
                                    </CardHeader>

                                    <CardContent>

                                        <div className="text-center">

                                            <div className="relative inline-flex items-center justify-center w-32 h-32">

                                                <svg className="w-full h-full -rotate-90">

                                                    <circle
                                                        cx="64"
                                                        cy="64"
                                                        r="56"
                                                        stroke="currentColor"
                                                        strokeWidth="8"
                                                        fill="none"
                                                        className="text-secondary"
                                                    />

                                                    <circle
                                                        cx="64"
                                                        cy="64"
                                                        r="56"
                                                        stroke="url(#gradient)"
                                                        strokeWidth="8"
                                                        fill="none"
                                                        strokeLinecap="round"
                                                        strokeDasharray="317 352"
                                                    />

                                                </svg>

                                                <span className="absolute text-4xl font-bold">
                                                    92
                                                </span>

                                            </div>

                                            <p className="text-sm text-muted-foreground mt-3">
                                                Top 8% of developers
                                            </p>

                                        </div>

                                    </CardContent>

                                </Card>

                            </div>

                        </div>



                    </div>
                )}
            </div>
        </Layout>
    );
};