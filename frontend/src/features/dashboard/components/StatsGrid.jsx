import {
  Code2,
  Star,
  GitFork,
  Activity,
  Calendar,
  Flame,
  GitPullRequest,
  GitMerge,
  GitBranch,
  AlertCircle,
  Eye,
  MessageSquare
} from "lucide-react";

function StatCard({ icon, label, value, color = "text-primary" }) {
  return (
    <div className="flex flex-col gap-1 p-4 rounded-xl bg-card border border-border hover:border-primary/30 transition-colors">
      <div className={`${color} mb-1`}>{icon}</div>
      <span className="text-2xl font-bold font-mono">{value ?? "—"}</span>
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  );
}

export function StatsGrid({ metrics }) {
  return (
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
  );
}
