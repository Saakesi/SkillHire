import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Code2,
    Star,
    GitFork,
    Users,
    MapPin,
    Briefcase,
    ExternalLink,
    Edit3,
    TrendingUp,
    Calendar,
    Activity,
} from 'lucide-react';
// import { useAuth } from '../context/AuthContext';
import { Layout } from '../components/layout/Layout';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Avatar } from '../components/ui/Avatar';
import { StatCard } from '../components/ui/Stats';
import { Input, Select } from '../components/ui/Input';
import { PageLoader } from '../components/ui/Loader';

// Mock activity data for chart
const activityData = [
    { month: 'Jul', commits: 45 },
    { month: 'Aug', commits: 72 },
    { month: 'Sep', commits: 58 },
    { month: 'Oct', commits: 89 },
    { month: 'Nov', commits: 67 },
    { month: 'Dec', commits: 94 },
    { month: 'Jan', commits: 78 },
];

export const DeveloperDashboard = () => {
    //   const { user, loading, updateProfile } = useAuth();

    const [user] = useState({
        name: 'Harsh Singhal',
        username: 'harshsinghal',
        avatar: null,
        bio: 'Full-stack developer passionate about React and system design.',
        location: 'India',
        company: 'Open Source',
        joinedAt: '2022-03-01',
        openToWork: true,
        preferredRole: 'Frontend Engineer',
        stats: {
            totalRepos: 47,
            totalStars: 1200,
            totalForks: 83,
            followers: 642,
            contributions: 2847,
        },
        skills: ['React', 'TypeScript', 'Node.js', 'MongoDB'],
        topLanguages: [
            { name: 'TypeScript', percentage: 38, color: '#3178c6' },
            { name: 'JavaScript', percentage: 28, color: '#f7df1e' },
            { name: 'Python', percentage: 20, color: '#3776ab' },
            { name: 'C++', percentage: 14, color: '#00599c' },
        ],
    });


    const loading = false;

    const updateProfile = async (data) => {
        console.log('Mock updateProfile called with:', data);
        return { ...user, ...data };
    };

    const [editing, setEditing] = useState(false);
    const [formData, setFormData] = useState({
        location: '',
        openToWork: true,
        preferredRole: '',
    });

    useEffect(() => {
        if (user) {
            setFormData({
                location: user.location || '',
                openToWork: user.openToWork ?? true,
                preferredRole: user.preferredRole || '',
            });
        }
    }, [user]);

    if (loading) return <PageLoader />;
    if (!user) return null;

    const handleSave = async () => {
        await updateProfile(formData);
        setEditing(false);
    };

    const publicProfileUrl = `${window.location.origin}/profile/${user.username}`;

    return (
        <Layout showFooter={false}>
            <div className="min-h-screen bg-background">
                {/* Header */}
                <div className="gradient-bg-subtle py-12">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6">
                            <Avatar src={user.avatar} name={user.name} size="2xl" />

                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                    <h1 className="text-3xl font-bold text-foreground">{user.name}</h1>
                                    {user.openToWork && (
                                        <Badge variant="success">Open to Work</Badge>
                                    )}
                                </div>
                                <p className="text-muted-foreground mb-2">@{user.username}</p>
                                <p className="text-foreground mb-4">{user.bio}</p>

                                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                                    {user.location && (
                                        <span className="flex items-center gap-1">
                                            <MapPin className="w-4 h-4" />
                                            {user.location}
                                        </span>
                                    )}
                                    {user.company && (
                                        <span className="flex items-center gap-1">
                                            <Briefcase className="w-4 h-4" />
                                            {user.company}
                                        </span>
                                    )}
                                    <span className="flex items-center gap-1">
                                        <Calendar className="w-4 h-4" />
                                        Joined {new Date(user.joinedAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                                    </span>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <Link to={`/profile/${user.username}`}>
                                    <Button variant="outline" icon={<ExternalLink className="w-4 h-4" />}>
                                        View Public Profile
                                    </Button>
                                </Link>
                                <Button
                                    variant="primary"
                                    icon={<Edit3 className="w-4 h-4" />}
                                    onClick={() => setEditing(true)}
                                >
                                    Edit Profile
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Stats */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                        <StatCard
                            icon={<Code2 className="w-5 h-5" />}
                            label="Total Repos"
                            value={user.stats.totalRepos}
                            trend="+5"
                            trendUp
                        />
                        <StatCard
                            icon={<Star className="w-5 h-5" />}
                            label="Total Stars"
                            value={user.stats.totalStars.toLocaleString()}
                            trend="+12%"
                            trendUp
                        />
                        <StatCard
                            icon={<GitFork className="w-5 h-5" />}
                            label="Total Forks"
                            value={user.stats.totalForks}
                        />
                        <StatCard
                            icon={<Users className="w-5 h-5" />}
                            label="Followers"
                            value={user.stats.followers}
                            trend="+8%"
                            trendUp
                        />
                    </div>

                    <div className="grid lg:grid-cols-3 gap-8">
                        {/* Left Column */}
                        <div className="lg:col-span-2 space-y-8">
                            {/* Activity Chart */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Activity className="w-5 h-5 text-primary" />
                                        Contribution Activity
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="h-48 flex items-end gap-2">
                                        {activityData.map((item, index) => (
                                            <motion.div
                                                key={item.month}
                                                initial={{ height: 0 }}
                                                animate={{ height: `${(item.commits / 100) * 100}%` }}
                                                transition={{ delay: index * 0.1 }}
                                                className="flex-1 flex flex-col items-center"
                                            >
                                                <div
                                                    className="w-full rounded-t-lg gradient-bg"
                                                    style={{ height: '100%' }}
                                                />
                                                <span className="text-xs text-muted-foreground mt-2">
                                                    {item.month}
                                                </span>
                                            </motion.div>
                                        ))}
                                    </div>
                                    <div className="mt-4 text-center">
                                        <p className="text-2xl font-bold text-foreground">
                                            {user.stats.contributions.toLocaleString()}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            contributions in the last year
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Top Languages */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Code2 className="w-5 h-5 text-primary" />
                                        Top Languages
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {user.topLanguages.map((lang) => (
                                            <div key={lang.name}>
                                                <div className="flex items-center justify-between mb-2">
                                                    <div className="flex items-center gap-2">
                                                        <span
                                                            className="w-3 h-3 rounded-full"
                                                            style={{ backgroundColor: lang.color }}
                                                        />
                                                        <span className="font-medium text-foreground">
                                                            {lang.name}
                                                        </span>
                                                    </div>
                                                    <span className="text-muted-foreground">
                                                        {lang.percentage}%
                                                    </span>
                                                </div>
                                                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${lang.percentage}%` }}
                                                        transition={{ duration: 0.5 }}
                                                        className="h-full rounded-full"
                                                        style={{ backgroundColor: lang.color }}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Right Column */}
                        <div className="space-y-8">
                            {/* Public Profile URL */}
                            <Card variant="gradient">
                                <CardHeader>
                                    <CardTitle className="text-lg">Your Public Profile</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center gap-2 p-3 bg-background/50 rounded-lg">
                                        <code className="text-sm text-foreground truncate flex-1">
                                            {publicProfileUrl}
                                        </code>
                                        <button
                                            onClick={() => navigator.clipboard.writeText(publicProfileUrl)}
                                            className="text-primary hover:text-primary/80 transition-colors"
                                        >
                                            Copy
                                        </button>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Skills */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <TrendingUp className="w-5 h-5 text-primary" />
                                        Skills
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex flex-wrap gap-2">
                                        {user.skills.map((skill) => (
                                            <Badge key={skill} variant="primary">
                                                {skill}
                                            </Badge>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Quick Stats */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Developer Score</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-center">
                                        <div className="relative inline-flex items-center justify-center w-32 h-32 mb-4">
                                            <svg className="w-full h-full transform -rotate-90">
                                                <circle
                                                    cx="64"
                                                    cy="64"
                                                    r="56"
                                                    stroke="currentColor"
                                                    strokeWidth="8"
                                                    fill="none"
                                                    className="text-secondary"
                                                />
                                                <motion.circle
                                                    cx="64"
                                                    cy="64"
                                                    r="56"
                                                    stroke="url(#gradient)"
                                                    strokeWidth="8"
                                                    fill="none"
                                                    strokeLinecap="round"
                                                    initial={{ strokeDasharray: '0 352' }}
                                                    animate={{ strokeDasharray: '317 352' }}
                                                    transition={{ duration: 1 }}
                                                />
                                                <defs>
                                                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                                        <stop offset="0%" stopColor="hsl(var(--primary))" />
                                                        <stop offset="100%" stopColor="hsl(var(--accent))" />
                                                    </linearGradient>
                                                </defs>
                                            </svg>
                                            <span className="absolute text-4xl font-bold text-foreground">92</span>
                                        </div>
                                        <p className="text-sm text-muted-foreground">
                                            Top 8% of developers
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>

            {/* Edit Modal */}
            {editing && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-card border border-border rounded-2xl p-8 w-full max-w-md shadow-xl"
                    >
                        <h2 className="text-2xl font-bold text-foreground mb-6">Edit Profile</h2>

                        <div className="space-y-4">
                            <Input
                                label="Location"
                                value={formData.location}
                                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                placeholder="San Francisco, CA"
                            />

                            <Input
                                label="Preferred Role"
                                value={formData.preferredRole}
                                onChange={(e) => setFormData({ ...formData, preferredRole: e.target.value })}
                                placeholder="Senior Frontend Engineer"
                            />

                            <div className="flex items-center justify-between py-2">
                                <label className="text-sm font-medium text-foreground">Open to Work</label>
                                <button
                                    onClick={() => setFormData({ ...formData, openToWork: !formData.openToWork })}
                                    className={`relative w-12 h-6 rounded-full transition-colors ${formData.openToWork ? 'bg-primary' : 'bg-secondary'
                                        }`}
                                >
                                    <span
                                        className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${formData.openToWork ? 'translate-x-6' : ''
                                            }`}
                                    />
                                </button>
                            </div>
                        </div>

                        <div className="flex gap-3 mt-8">
                            <Button variant="secondary" onClick={() => setEditing(false)} className="flex-1">
                                Cancel
                            </Button>
                            <Button variant="gradient" onClick={handleSave} className="flex-1">
                                Save Changes
                            </Button>
                        </div>
                    </motion.div>
                </div>
            )}
        </Layout>
    );
};
