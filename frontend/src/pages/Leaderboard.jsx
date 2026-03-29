import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
    Trophy, Medal, Crown, Code2, Star, RefreshCw,
    Users, ChevronLeft, ChevronRight, Target,
    Filter, X, GraduationCap, Building2, BookOpen
} from "lucide-react";
import { Layout } from "../components/layout/Layout";
import { Avatar } from "../components/ui/Avatar";
import { useAuth } from "../context/AuthContext";

const PER_PAGE = 25;
const API = import.meta.env.VITE_API_URL;

const CATEGORIES = [
    { id: "global",     label: "Global",      icon: <Trophy className="w-3.5 h-3.5" /> },
    { id: "frontend",   label: "Frontend",    icon: <Code2 className="w-3.5 h-3.5" /> },
    { id: "backend",    label: "Backend",     icon: <Code2 className="w-3.5 h-3.5" /> },
    { id: "fullStack",  label: "Full Stack",  icon: <Code2 className="w-3.5 h-3.5" /> },
    { id: "openSource", label: "Open Source", icon: <Star className="w-3.5 h-3.5" /> },
    { id: "algorithms", label: "Algorithms",  icon: <Medal className="w-3.5 h-3.5" /> },
];

// Branches — must match the options in DeveloperDashboard branch select
const COMMON_BRANCHES = [
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
    "Other",
];

function RankBadge({ rank }) {
    if (rank === 1) return (
        <div className="w-9 h-9 rounded-full bg-yellow-500/20 flex items-center justify-center flex-shrink-0">
            <Crown className="w-4 h-4 text-yellow-500" />
        </div>
    );
    if (rank === 2) return (
        <div className="w-9 h-9 rounded-full bg-slate-400/20 flex items-center justify-center flex-shrink-0">
            <Medal className="w-4 h-4 text-slate-400" />
        </div>
    );
    if (rank === 3) return (
        <div className="w-9 h-9 rounded-full bg-orange-600/20 flex items-center justify-center flex-shrink-0">
            <Medal className="w-4 h-4 text-orange-600" />
        </div>
    );
    return (
        <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-bold font-mono text-muted-foreground tabular-nums">{rank}</span>
        </div>
    );
}

function ScoreBar({ score, max }) {
    const pct = max > 0 ? Math.min((score / max) * 100, 100) : 0;
    return (
        <div className="w-28 h-1.5 bg-secondary rounded-full overflow-hidden">
            <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="h-full rounded-full bg-gradient-to-r from-primary to-accent"
            />
        </div>
    );
}

// A single active filter chip
function FilterChip({ label, onRemove }) {
    return (
        <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs text-primary font-medium">
            {label}
            <button onClick={onRemove} className="hover:text-primary/60 transition-colors ml-0.5">
                <X className="w-3 h-3" />
            </button>
        </span>
    );
}

export default function Leaderboard() {
    const { profile, isAuthenticated } = useAuth();
    const myUsername = profile?.username;

    const [category, setCategory] = useState("global");
    const [leaders, setLeaders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);

    // Filters
    const [showFilters, setShowFilters] = useState(false);
    const [collegeInput, setCollegeInput]   = useState("");   // display name
    const [batchInput, setBatchInput]       = useState("");
    const [branchInput, setBranchInput]     = useState("");
    // Applied (committed) filters
    const [appliedFilters, setAppliedFilters] = useState({ college: "", batch: "", branch: "" });

    // College search via /api/colleges
    const [collegeResults, setCollegeResults] = useState([]);
    const [collegeLoading, setCollegeLoading] = useState(false);
    const collegeDropdownRef = useRef(null);

    // Batch options (static range)
    const batchYears = Array.from({ length: 11 }, (_, i) => 2020 + i).reverse();

    // My rank
    const [myRank, setMyRank]     = useState(null);
    const [myScore, setMyScore]   = useState(null);
    const [rankLoading, setRankLoading] = useState(false);

    const hasActiveFilters = !!(appliedFilters.college || appliedFilters.batch || appliedFilters.branch);

    const totalPages = Math.ceil(leaders.length / PER_PAGE);
    const paginated  = leaders.slice((page - 1) * PER_PAGE, page * PER_PAGE);
    const scoreKey   = category === "global" ? "overallScore" : "categoryScore";
    const maxScore   = leaders.length > 0
        ? Math.max(...leaders.map(u => u[scoreKey] ?? 0), 1)
        : 100;

    // College search — debounced, uses /api/colleges
    useEffect(() => {
        if (collegeInput.length < 2) { setCollegeResults([]); return; }
        const t = setTimeout(() => {
            setCollegeLoading(true);
            axios.get(`${API}/api/colleges?search=${encodeURIComponent(collegeInput)}`)
                .then(res => setCollegeResults(res.data || []))
                .catch(() => setCollegeResults([]))
                .finally(() => setCollegeLoading(false));
        }, 300);
        return () => clearTimeout(t);
    }, [collegeInput]);

    // Close college dropdown when clicking outside
    useEffect(() => {
        const handler = (e) => {
            if (collegeDropdownRef.current && !collegeDropdownRef.current.contains(e.target)) {
                setCollegeResults([]);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    // Fetch leaderboard when category or appliedFilters change
    useEffect(() => {
        setLoading(true);
        setLeaders([]);
        setPage(1);

        let req;
        if (hasActiveFilters) {
            const params = new URLSearchParams({ category });
            if (appliedFilters.college) params.set("college", appliedFilters.college);
            if (appliedFilters.batch)   params.set("batch",   appliedFilters.batch);
            if (appliedFilters.branch)  params.set("branch",  appliedFilters.branch);
            req = axios.get(`${API}/api/ranking/leaderboard/filter?${params}`);
        } else {
            const url = category === "global"
                ? `${API}/api/ranking/leaderboard`
                : `${API}/api/ranking/leaderboard/${category}`;
            req = axios.get(url);
        }

        req.then(res => {
            const data = hasActiveFilters
                ? res.data?.leaderboard
                : (category === "global" ? res.data : res.data?.leaderboard);
            setLeaders(data || []);
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    }, [category, appliedFilters]);

    // Fetch my rank
    useEffect(() => {
        if (!isAuthenticated || !myUsername || hasActiveFilters) {
            setMyRank(null); setMyScore(null);
            return;
        }
        setMyRank(null); setMyScore(null);
        setRankLoading(true);

        const url = category === "global"
            ? `${API}/api/ranking/rank/${myUsername}`
            : `${API}/api/ranking/leaderboard/${category}/${myUsername}`;

        axios.get(url)
            .then(res => {
                setMyRank(res.data.rank ?? null);
                setMyScore(res.data[scoreKey] ?? res.data.overallScore ?? null);
            })
            .catch(() => { setMyRank(null); setMyScore(null); })
            .finally(() => setRankLoading(false));
    }, [category, myUsername, isAuthenticated, hasActiveFilters]);

    const jumpToMyPage = () => {
        if (!myRank) return;
        const targetPage = Math.ceil(myRank / PER_PAGE);
        setPage(targetPage);
        setTimeout(() => {
            document.getElementById(`user-row-${myUsername}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
        }, 150);
    };

    const applyFilters = () => {
        setAppliedFilters({ college: collegeInput.trim(), batch: batchInput, branch: branchInput });
        setShowFilters(false);
    };

    const clearFilters = () => {
        setCollegeInput(""); setCollegeResults([]);
        setBatchInput(""); setBranchInput("");
        setAppliedFilters({ college: "", batch: "", branch: "" });
    };

    const removeFilter = (key) => {
        const next = { ...appliedFilters, [key]: "" };
        setAppliedFilters(next);
        if (key === "college") { setCollegeInput(""); setCollegeResults([]); }
        if (key === "batch")   setBatchInput("");
        if (key === "branch")  setBranchInput("");
    };

    return (
        <Layout showFooter={false}>
            <div className="min-h-screen bg-background pb-16">

                {/* Header */}
                <div className="border-b border-border bg-card/50 backdrop-blur-sm">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <div className="flex items-center gap-2.5 mb-1">
                                    <Trophy className="w-5 h-5 text-yellow-500" />
                                    <h1 className="text-xl font-bold">Leaderboard</h1>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    {leaders.length > 0
                                        ? `${leaders.length} developers ${hasActiveFilters ? "matching filters" : "ranked"}`
                                        : "Developer rankings by skill score"}
                                </p>
                            </div>

                            {/* My rank pill */}
                            {isAuthenticated && !hasActiveFilters && !rankLoading && myRank && (
                                <button
                                    onClick={jumpToMyPage}
                                    className="flex items-center gap-2 px-3 py-2 rounded-xl bg-primary/10 border border-primary/20 hover:bg-primary/20 transition-colors flex-shrink-0"
                                >
                                    <Target className="w-3.5 h-3.5 text-primary" />
                                    <div className="text-left">
                                        <p className="text-xs text-muted-foreground leading-none mb-0.5">Your rank</p>
                                        <p className="text-sm font-bold font-mono text-primary leading-none">
                                            #{myRank.toLocaleString()}
                                        </p>
                                    </div>
                                    <ChevronRight className="w-3.5 h-3.5 text-primary opacity-60" />
                                </button>
                            )}
                            {isAuthenticated && !hasActiveFilters && rankLoading && (
                                <div className="px-3 py-2 rounded-xl bg-secondary border border-border">
                                    <p className="text-xs text-muted-foreground">Finding your rank…</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-4">

                    {/* Category tabs + Filter button row */}
                    <div className="flex items-center gap-2 flex-wrap">
                        <div className="flex flex-wrap gap-2 flex-1">
                            {CATEGORIES.map(cat => (
                                <button
                                    key={cat.id}
                                    onClick={() => setCategory(cat.id)}
                                    className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-medium transition-all ${
                                        category === cat.id
                                            ? "bg-primary text-primary-foreground shadow-sm"
                                            : "bg-secondary text-secondary-foreground hover:bg-secondary/70"
                                    }`}
                                >
                                    {cat.icon}
                                    {cat.label}
                                </button>
                            ))}
                        </div>

                        {/* Filter toggle button */}
                        <button
                            onClick={() => setShowFilters(v => !v)}
                            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-medium transition-all border flex-shrink-0 ${
                                hasActiveFilters
                                    ? "bg-primary/10 border-primary/30 text-primary"
                                    : "bg-secondary border-border text-secondary-foreground hover:bg-secondary/70"
                            }`}
                        >
                            <Filter className="w-3.5 h-3.5" />
                            Filters
                            {hasActiveFilters && (
                                <span className="w-4 h-4 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">
                                    {[appliedFilters.college, appliedFilters.batch, appliedFilters.branch].filter(Boolean).length}
                                </span>
                            )}
                        </button>
                    </div>

                    {/* Active filter chips */}
                    {hasActiveFilters && (
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs text-muted-foreground">Filtered by:</span>
                            {appliedFilters.college && (
                                <FilterChip
                                    label={<><Building2 className="w-3 h-3 inline mr-1" />{appliedFilters.college}</>}
                                    onRemove={() => removeFilter("college")}
                                />
                            )}
                            {appliedFilters.batch && (
                                <FilterChip
                                    label={<><GraduationCap className="w-3 h-3 inline mr-1" />Batch {appliedFilters.batch}</>}
                                    onRemove={() => removeFilter("batch")}
                                />
                            )}
                            {appliedFilters.branch && (
                                <FilterChip
                                    label={<><BookOpen className="w-3 h-3 inline mr-1" />{appliedFilters.branch}</>}
                                    onRemove={() => removeFilter("branch")}
                                />
                            )}
                            <button
                                onClick={clearFilters}
                                className="text-xs text-muted-foreground hover:text-foreground transition-colors underline underline-offset-2"
                            >
                                Clear all
                            </button>
                        </div>
                    )}

                    {/* Filter Panel */}
                    <AnimatePresence>
                        {showFilters && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.2 }}
                                className="overflow-hidden"
                            >
                                <div className="rounded-xl border border-border bg-card p-5 space-y-5">
                                    <div className="flex items-center justify-between">
                                        <h3 className="font-semibold text-sm flex items-center gap-2">
                                            <Filter className="w-4 h-4 text-primary" /> Filter Leaderboard
                                        </h3>
                                        <button onClick={() => setShowFilters(false)} className="text-muted-foreground hover:text-foreground">
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

                                        {/* College — uses /api/colleges search */}
                                        <div className="space-y-2">
                                            <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                                                <Building2 className="w-3.5 h-3.5" /> College
                                            </label>
                                            <div className="relative" ref={collegeDropdownRef}>
                                                <input
                                                    value={collegeInput}
                                                    onChange={e => setCollegeInput(e.target.value)}
                                                    placeholder="Search college…"
                                                    className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-1 focus:ring-primary"
                                                />
                                                {collegeLoading && (
                                                    <span className="absolute right-3 top-2.5 text-muted-foreground">
                                                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                                    </span>
                                                )}
                                                {collegeResults.length > 0 && (
                                                    <div className="absolute z-20 top-full mt-1 w-full rounded-lg border border-border bg-popover shadow-lg max-h-52 overflow-y-auto">
                                                        {collegeResults.map(c => (
                                                            <button
                                                                key={c.id}
                                                                onClick={() => {
                                                                    setCollegeInput(c.name);
                                                                    setCollegeResults([]);
                                                                }}
                                                                className="w-full text-left px-3 py-2 hover:bg-accent transition-colors"
                                                            >
                                                                <p className="text-sm font-medium truncate">{c.name}</p>
                                                                <p className="text-xs text-muted-foreground">{c.country}</p>
                                                            </button>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Batch / Graduation Year */}
                                        <div className="space-y-2">
                                            <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                                                <GraduationCap className="w-3.5 h-3.5" /> Batch (Graduation Year)
                                            </label>
                                            <select
                                                value={batchInput}
                                                onChange={e => setBatchInput(e.target.value)}
                                                className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-1 focus:ring-primary"
                                            >
                                                <option value="">All batches</option>
                                                {batchYears.map(y => (
                                                    <option key={y} value={y}>{y}</option>
                                                ))}
                                            </select>
                                        </div>

                                        {/* Branch */}
                                        <div className="space-y-2">
                                            <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                                                <BookOpen className="w-3.5 h-3.5" /> Branch
                                            </label>
                                            <select
                                                value={branchInput}
                                                onChange={e => setBranchInput(e.target.value)}
                                                className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-1 focus:ring-primary"
                                            >
                                                <option value="">All branches</option>
                                                {COMMON_BRANCHES.map(b => (
                                                    <option key={b} value={b}>{b}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center justify-between pt-1 border-t border-border">
                                        <button
                                            onClick={() => { setCollegeInput(""); setBatchInput(""); setBranchInput(""); }}
                                            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                                        >
                                            Reset
                                        </button>
                                        <button
                                            onClick={applyFilters}
                                            disabled={!collegeInput && !batchInput && !branchInput}
                                            className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                        >
                                            Apply Filters
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* My position banner (when on wrong page) */}
                    {isAuthenticated && !hasActiveFilters && !rankLoading && myRank && myScore !== null && (
                        (() => {
                            const myPage = Math.ceil(myRank / PER_PAGE);
                            if (myPage === page) return null;
                            return (
                                <div className="flex items-center justify-between gap-4 px-4 py-3 rounded-xl bg-primary/5 border border-primary/20">
                                    <div className="flex items-center gap-3">
                                        <Avatar src={profile?.avatarUrl} name={myUsername} size="sm" />
                                        <div>
                                            <p className="text-sm font-medium">{myUsername}</p>
                                            <p className="text-xs text-muted-foreground">
                                                Rank <span className="font-bold font-mono text-primary">#{myRank.toLocaleString()}</span>
                                                {" · "}Score <span className="font-mono font-bold text-foreground">{Math.round(myScore)}</span>
                                                {" · "}Page <span className="font-mono">{myPage}</span> of {totalPages}
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={jumpToMyPage}
                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors flex-shrink-0"
                                    >
                                        <Target className="w-3 h-3" />
                                        Jump to my rank
                                    </button>
                                </div>
                            );
                        })()
                    )}

                    {/* Loading */}
                    {loading && (
                        <div className="flex items-center justify-center py-20">
                            <RefreshCw className="w-5 h-5 text-primary animate-spin" />
                        </div>
                    )}

                    {/* Empty */}
                    {!loading && leaders.length === 0 && (
                        <div className="text-center py-20">
                            <Users className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                            <p className="font-medium">No developers found</p>
                            <p className="text-sm text-muted-foreground mt-1">
                                {hasActiveFilters
                                    ? "No developers match the selected filters. Try adjusting them."
                                    : category === "global"
                                        ? "Developers appear here after running a profile analysis"
                                        : "No developers qualify for this category yet"}
                            </p>
                            {hasActiveFilters && (
                                <button onClick={clearFilters} className="mt-4 text-sm text-primary hover:underline">
                                    Clear filters
                                </button>
                            )}
                        </div>
                    )}

                    {/* Leaderboard */}
                    {!loading && leaders.length > 0 && (
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={`${category}-${JSON.stringify(appliedFilters)}`}
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="space-y-4"
                            >
                                {/* Top 3 podium — page 1 only, no filters */}
                                {page === 1 && !hasActiveFilters && leaders.length >= 3 && (
                                    <div className="rounded-xl border border-border bg-card overflow-hidden">
                                        <div className="grid grid-cols-3 divide-x divide-border">
                                            {[leaders[1], leaders[0], leaders[2]].map((user, i) => {
                                                const podiumRank = [2, 1, 3][i];
                                                const score = user?.[scoreKey] ?? 0;
                                                const heightCls = ["pt-6 pb-5", "pt-4 pb-5", "pt-8 pb-5"][i];
                                                const isMe = user?.username === myUsername;
                                                return (
                                                    <a key={user?.username} href={`/profile/${user?.username}`}
                                                        className={`flex flex-col items-center ${heightCls} hover:bg-secondary/30 transition-colors ${isMe ? "bg-primary/5" : ""}`}>
                                                        <div className="relative">
                                                            <Avatar src={user?.avatarUrl} name={user?.username} size="sm" />
                                                            {isMe && <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-primary border-2 border-card" />}
                                                        </div>
                                                        <p className="text-xs font-semibold mt-2 truncate max-w-[80px] text-center px-1">
                                                            {user?.username}
                                                        </p>
                                                        <p className="text-xs font-bold font-mono text-muted-foreground">{Math.round(score)}</p>
                                                        <div className="mt-1.5">
                                                            <RankBadge rank={podiumRank} />
                                                        </div>
                                                    </a>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                {/* Ranked rows */}
                                <div className="rounded-xl border border-border bg-card overflow-hidden divide-y divide-border">
                                    {/* Column header */}
                                    <div className="flex items-center gap-4 px-5 py-2 bg-secondary/30">
                                        <div className="w-9" />
                                        <div className="w-8" />
                                        <div className="flex-1 text-xs font-medium text-muted-foreground">Developer</div>
                                        {hasActiveFilters && (
                                            <div className="hidden md:block text-xs font-medium text-muted-foreground w-32">College / Branch</div>
                                        )}
                                        <div className="hidden sm:flex items-center gap-3">
                                            <div className="w-28 text-xs font-medium text-muted-foreground text-right">Score</div>
                                            <div className="w-12 text-xs font-medium text-muted-foreground text-right">Pts</div>
                                        </div>
                                    </div>

                                    {paginated.map((user, i) => {
                                        const score = user[scoreKey] ?? user.overallScore ?? 0;
                                        const rank  = user.rank ?? ((page - 1) * PER_PAGE + i + 1);
                                        const isMe  = user.username === myUsername;
                                        return (
                                            <motion.div
                                                id={`user-row-${user.username}`}
                                                key={user.username}
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                transition={{ duration: 0.15, delay: Math.min(i * 0.015, 0.15) }}
                                                className={`flex items-center gap-4 px-5 py-2.5 hover:bg-secondary/30 transition-colors ${isMe ? "bg-primary/5 border-l-2 border-l-primary" : ""}`}
                                            >
                                                <RankBadge rank={rank} />
                                                <Avatar src={user.avatarUrl} name={user.username} size="sm" />

                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <a href={`/profile/${user.username}`}
                                                            className="font-medium text-sm hover:text-primary transition-colors truncate">
                                                            {user.username}
                                                        </a>
                                                        {isMe && (
                                                            <span className="px-1.5 py-0.5 rounded text-xs bg-primary/15 text-primary font-medium flex-shrink-0">
                                                                You
                                                            </span>
                                                        )}
                                                    </div>
                                                    {/* Show college/branch inline on mobile when filtered */}
                                                    {hasActiveFilters && (user.college || user.branch) && (
                                                        <p className="text-xs text-muted-foreground mt-0.5 truncate md:hidden">
                                                            {[user.college, user.branch, user.graduationYear].filter(Boolean).join(" · ")}
                                                        </p>
                                                    )}
                                                </div>

                                                {/* College / Branch column — desktop only */}
                                                {hasActiveFilters && (
                                                    <div className="hidden md:block w-32 min-w-0">
                                                        {user.college && (
                                                            <p className="text-xs text-muted-foreground truncate" title={user.college}>
                                                                {user.college}
                                                            </p>
                                                        )}
                                                        {(user.branch || user.graduationYear) && (
                                                            <p className="text-xs text-muted-foreground/60 truncate">
                                                                {[user.branch, user.graduationYear].filter(Boolean).join(" · ")}
                                                            </p>
                                                        )}
                                                    </div>
                                                )}

                                                <div className="hidden sm:flex items-center gap-3">
                                                    <ScoreBar score={score} max={maxScore} />
                                                    <span className="text-sm font-bold font-mono w-12 text-right tabular-nums">
                                                        {Math.round(score)}
                                                    </span>
                                                </div>

                                                <span className="sm:hidden text-sm font-bold font-mono tabular-nums">
                                                    {Math.round(score)}
                                                </span>
                                            </motion.div>
                                        );
                                    })}
                                </div>

                                {/* Pagination */}
                                {totalPages > 1 && (
                                    <div className="flex items-center justify-between gap-4 pt-1">
                                        <p className="text-sm text-muted-foreground tabular-nums">
                                            {(page - 1) * PER_PAGE + 1}–{Math.min(page * PER_PAGE, leaders.length)} of {leaders.length}
                                        </p>
                                        <div className="flex items-center gap-1">
                                            <button
                                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                                disabled={page === 1}
                                                className="p-1.5 rounded-lg border border-border hover:bg-secondary disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                            >
                                                <ChevronLeft className="w-4 h-4" />
                                            </button>

                                            {(() => {
                                                const pages = [];
                                                let start = Math.max(1, page - 2);
                                                let end = Math.min(totalPages, start + 4);
                                                if (end - start < 4) start = Math.max(1, end - 4);
                                                if (start > 1) { pages.push(1); if (start > 2) pages.push("…"); }
                                                for (let p = start; p <= end; p++) pages.push(p);
                                                if (end < totalPages) { if (end < totalPages - 1) pages.push("…"); pages.push(totalPages); }
                                                return pages.map((p, i) =>
                                                    p === "…" ? (
                                                        <span key={`e-${i}`} className="w-8 text-center text-muted-foreground text-sm">…</span>
                                                    ) : (
                                                        <button key={p} onClick={() => setPage(p)}
                                                            className={`w-8 h-8 text-sm rounded-lg transition-colors tabular-nums ${p === page ? "bg-primary text-primary-foreground font-semibold" : "hover:bg-secondary text-muted-foreground"}`}>
                                                            {p}
                                                        </button>
                                                    )
                                                );
                                            })()}

                                            <button
                                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                                disabled={page === totalPages}
                                                className="p-1.5 rounded-lg border border-border hover:bg-secondary disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                            >
                                                <ChevronRight className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        </AnimatePresence>
                    )}
                </div>
            </div>
        </Layout>
    );
}
