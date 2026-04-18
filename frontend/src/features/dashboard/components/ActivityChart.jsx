import { motion } from "framer-motion";
import { Activity } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "../../../components/ui/Card";

export function ActivityChart({ monthlyCommits, maxCommits, commitCount6Months }) {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4 }}>
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
            <span className="font-bold font-mono text-foreground">{commitCount6Months}</span> commits in the last 6 months
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}
