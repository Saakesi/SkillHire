import { motion } from "framer-motion";
import { Trophy } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "../../../components/ui/Card";

export function LeetCodeSection({ lc, lcScore, topAlgoTags }) {
  if (lc && lc.solved?.total > 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4 }}
        className="flex-1"
      >
        <Card className="h-full">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-yellow-500" /> LeetCode Score
              </span>
              <span className="text-sm font-normal text-muted-foreground">
                <span>: </span>
                <span className="font-bold font-mono text-foreground">{lcScore}</span>/100
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
                  {topAlgoTags.map((tag) => (
                    <span
                      key={tag.tagName}
                      className="px-2 py-1 rounded-lg text-xs bg-primary/10 text-primary border border-primary/20"
                    >
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      className="flex-1"
    >
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-yellow-500" /> LeetCode
          </CardTitle>
        </CardHeader>
        <CardContent className="h-full">
          <p className="text-sm text-muted-foreground">
            LeetCode profile not connected yet. Add your username above and click Analyze.
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}
