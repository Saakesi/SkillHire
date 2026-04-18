import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "../../../components/ui/Card";
import {
  diagnosisCardVariants,
  diagnosisGridVariants,
  getDiagnosisPriority
} from "../utils/dashboardUtils";

export function DiagnosisSection({ developerInsights, insightsLoading, insightsError }) {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4 }}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" /> Developer Diagnosis
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {insightsLoading ? (
            <p className="text-sm text-muted-foreground">Loading personalized insights...</p>
          ) : insightsError ? (
            <p className="text-sm text-muted-foreground">{insightsError}</p>
          ) : developerInsights?.insights?.length > 0 ? (
            <motion.div
              variants={diagnosisGridVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              {developerInsights.insights.map((item, index) => {
                const priority = getDiagnosisPriority(developerInsights.insightObjects?.[index]?.percentile);
                return (
                  <motion.div
                    key={`${item.category}-${index}`}
                    variants={diagnosisCardVariants}
                    whileHover={{ y: -2, scale: 1.01 }}
                    className="rounded-xl border border-border bg-background p-4 space-y-2"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-semibold text-sm truncate">
                          {developerInsights.insightObjects?.[index]?.metricLabel || item.category}
                        </p>
                        <p className="text-xs text-muted-foreground">{item.category}</p>
                      </div>
                      <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${priority.textClass}`}>
                        <motion.span
                          className={`w-2 h-2 rounded-full ${priority.dotClass}`}
                          animate={{ opacity: [0.7, 1, 0.7] }}
                          transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
                        />
                        {priority.label}
                      </span>
                    </div>
                    <p className="text-sm text-foreground">{item.observation}</p>
                    <p className="text-sm text-muted-foreground">{item.suggestion}</p>
                  </motion.div>
                );
              })}
            </motion.div>
          ) : (
            <p className="text-sm text-muted-foreground">Personalized insights will appear after your analysis is available.</p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
