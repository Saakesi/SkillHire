import { motion } from "framer-motion";
import { Award } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "../../../components/ui/Card";
import { formatBadgeLabel, getBadgeDescription } from "../utils/dashboardUtils";

export function BadgesSection({ badges }) {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4 }}>
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
  );
}
