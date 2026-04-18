import { motion } from "framer-motion";
import { Card } from "../../../components/ui/Card";

function ScoreCircle({ score }) {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const progress = (Math.min(score, 100) / 100) * circumference;
  const color = score >= 75 ? "#22c55e" : score >= 50 ? "#f59e0b" : "#6366f1";

  return (
    <div className="relative inline-flex items-center justify-center w-36 h-36">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 128 128">
        <circle cx="64" cy="64" r={radius} stroke="currentColor" strokeWidth="10" fill="none" className="text-border" />
        <motion.circle
          cx="64"
          cy="64"
          r={radius}
          stroke={color}
          strokeWidth="10"
          fill="none"
          strokeLinecap="round"
          initial={{ strokeDasharray: `0 ${circumference}` }}
          animate={{ strokeDasharray: `${progress} ${circumference}` }}
          transition={{ duration: 1.4, ease: "easeOut", delay: 0.3 }}
        />
      </svg>
      <div className="absolute text-center">
        <span className="text-3xl font-bold font-mono">{Math.round(score)}</span>
        <span className="block text-xs text-muted-foreground">/ 100</span>
      </div>
    </div>
  );
}

export function ScoreCard({ score }) {
  return (
    <Card className="lg:col-span-1 flex flex-col items-center justify-center py-6">
      <p className="text-sm font-medium text-muted-foreground mb-3">Developer Score</p>
      <ScoreCircle score={score} />
      <p className="text-xs text-muted-foreground mt-3 text-center">
        {score >= 75 ? "Excellent" : score >= 50 ? "Good" : "Developing"}
      </p>
    </Card>
  );
}
