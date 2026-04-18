import { motion } from "framer-motion";
import { Shield, CheckCircle2, XCircle } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "../../../components/ui/Card";

export function QualityIndicators({ qualityIndicators }) {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4 }}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-primary" /> Project Quality
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {qualityIndicators.map((item) => (
              <div key={item.label} className="flex items-center justify-between py-1.5 border-b border-border last:border-0">
                <div className="flex items-center gap-2 text-sm">
                  {item.count > 0 ? (
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                  ) : (
                    <XCircle className="w-4 h-4 text-muted-foreground" />
                  )}
                  <span className={item.count > 0 ? "" : "text-muted-foreground"}>{item.label}</span>
                </div>
                {item.count > 0 && <span className="text-xs text-muted-foreground font-mono">{item.count} repos</span>}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
