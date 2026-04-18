import { motion } from "framer-motion";
import { Code2 } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "../../../components/ui/Card";
import ProgressBar from "../../../components/ui/ProgressBar";
import { LANGUAGE_COLORS } from "../utils/dashboardUtils";

export function TopLanguages({ topLanguages }) {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4 }}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code2 className="w-4 h-4 text-primary" /> Top Languages
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {topLanguages.map((lang) => (
              <div key={lang.name}>
                <div className="flex justify-between text-sm mb-1">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: LANGUAGE_COLORS[lang.name.toLowerCase()] || "#6366f1" }}
                    />
                    <span className="font-medium">{lang.name}</span>
                  </div>
                  <span className="text-muted-foreground font-mono">{lang.percent}%</span>
                </div>
                <ProgressBar value={lang.percent} color={LANGUAGE_COLORS[lang.name.toLowerCase()] || "#6366f1"} />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
