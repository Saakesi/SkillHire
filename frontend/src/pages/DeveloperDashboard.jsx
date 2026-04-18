import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Activity,
  BarChart3,
  Check,
  Copy,
  ExternalLink,
  Eye,
  PlayCircle,
  RefreshCw
} from "lucide-react";
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip
} from "recharts";
import { useAuth } from "../context/AuthContext";
import { Layout } from "../components/layout/Layout";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { PageLoader } from "../components/ui/Loader";
import { useAnalysis } from "../features/dashboard/hooks/useAnalysis";
import { useProfileActions } from "../features/dashboard/hooks/useProfileActions";
import { useConnections } from "../features/dashboard/hooks/useConnections";
import { useInsights } from "../features/dashboard/hooks/useInsights";
import { ProfileHeader } from "../features/dashboard/components/ProfileHeader";
import { ConnectionsSection } from "../features/dashboard/components/ConnectionsSection";
import { ScoreCard } from "../features/dashboard/components/ScoreCard";
import { StatsGrid } from "../features/dashboard/components/StatsGrid";
import { DiagnosisSection } from "../features/dashboard/components/DiagnosisSection";
import { ActivityChart } from "../features/dashboard/components/ActivityChart";
import { TopLanguages } from "../features/dashboard/components/TopLanguages";
import { LeetCodeSection } from "../features/dashboard/components/LeetCodeSection";
import { ScoreBreakdown } from "../features/dashboard/components/ScoreBreakdown";
import { SkillsSection } from "../features/dashboard/components/SkillsSection";
import { QualityIndicators } from "../features/dashboard/components/QualityIndicators";
import { BadgesSection } from "../features/dashboard/components/BadgesSection";
import {
  fadeUp,
  getMonthlyCommits,
  getQualityItems,
  getRadarData,
  getScoreBreakdown,
  getTopAlgoTags,
  getTopLanguages
} from "../features/dashboard/utils/dashboardUtils";

export const DeveloperDashboard = () => {
  const { profile, isAuthenticated } = useAuth();
  const username = profile?.username;

  const {
    analysis,
    metrics,
    badges,
    analysisLoading,
    updatedAt,
    loading,
    overallScore,
    isAnalyzing,
    lc,
    lcScore,
    handleAnalyze
  } = useAnalysis(username);

  const profileActions = useProfileActions(profile);
  const {
    pendingConnections,
    connectionsLoading,
    connectionActioningId,
    acceptConnection,
    declineConnection
  } = useConnections(isAuthenticated);
  const { developerInsights, insightsLoading, insightsError } = useInsights(profile);

  const [copied, setCopied] = useState(false);

  const copyProfileUrl = () => {
    const url = `${window.location.origin}/profile/${username}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const monthlyCommits = useMemo(() => getMonthlyCommits(metrics), [metrics]);
  const maxCommits = Math.max(...monthlyCommits.map((m) => m.commits), 1);
  const topLanguages = useMemo(() => getTopLanguages(metrics), [metrics]);
  const radarData = useMemo(() => getRadarData(analysis), [analysis]);
  const scoreBreakdown = useMemo(() => getScoreBreakdown(analysis), [analysis]);
  const qualityItems = useMemo(() => getQualityItems(metrics), [metrics]);
  const topAlgoTags = useMemo(() => getTopAlgoTags(lc), [lc]);

  if (!profile) return <PageLoader />;

  return (
    <Layout showFooter={false}>
      <div className="min-h-screen bg-background pb-16">
        {profileActions.toastMessage && (
          <div className="fixed top-20 right-4 z-[100] max-w-xs rounded-xl border border-primary/20 bg-card px-4 py-2.5 text-sm shadow-lg">
            {profileActions.toastMessage}
          </div>
        )}

        <ProfileHeader
          profile={profile}
          metrics={metrics}
          isAnalyzing={isAnalyzing}
          loading={loading}
          updatedAt={updatedAt}
          handleAnalyze={handleAnalyze}
          profileActions={profileActions}
        />

        <ConnectionsSection
          connectionsLoading={connectionsLoading}
          pendingConnections={pendingConnections}
          connectionActioningId={connectionActioningId}
          acceptConnection={acceptConnection}
          declineConnection={declineConnection}
        />

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

        {metrics && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
            <motion.div {...fadeUp} className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <ScoreCard score={overallScore} />
              <StatsGrid metrics={metrics} />
            </motion.div>

            <DiagnosisSection developerInsights={developerInsights} insightsLoading={insightsLoading} insightsError={insightsError} />

            {(metrics.reviewsGiven > 0 || metrics.approvals > 0) && (
              <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4 }}>
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

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
              <div className="lg:col-span-2 space-y-6 h-full flex flex-col">
                <ActivityChart
                  monthlyCommits={monthlyCommits}
                  maxCommits={maxCommits}
                  commitCount6Months={metrics.commitCount6Months}
                />
                <TopLanguages topLanguages={topLanguages} />
                <LeetCodeSection lc={lc} lcScore={lcScore} topAlgoTags={topAlgoTags} />
              </div>

              <div className="space-y-6">
                <ScoreBreakdown scoreBreakdown={scoreBreakdown} />
                <SkillsSection metrics={metrics} lc={lc} />
                <QualityIndicators qualityIndicators={qualityItems} />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {badges.length > 0 && <BadgesSection badges={badges} />}

              <motion.div
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4 }}
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
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-xs text-primary hover:underline"
                    >
                      <ExternalLink className="w-3 h-3" /> View public profile
                    </a>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
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
                        name="Score"
                        dataKey="value"
                        stroke="#6366f1"
                        fill="#6366f1"
                        fillOpacity={0.25}
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
