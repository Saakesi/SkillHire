export function scoreBadgeColor(score) {
  if (score >= 75) return "bg-emerald-500/15 text-emerald-600 border-emerald-500/30";
  if (score >= 50) return "bg-blue-500/15 text-blue-600 border-blue-500/30";
  if (score >= 30) return "bg-yellow-500/15 text-yellow-600 border-yellow-500/30";
  return "bg-secondary text-muted-foreground border-border";
}

export function devTypeBadge(type) {
  const map = {
    "Frontend": "bg-purple-500/10 text-purple-600 border-purple-500/20",
    "Backend": "bg-blue-500/10 text-blue-600 border-blue-500/20",
    "Full Stack": "bg-gradient-to-r from-purple-500/10 to-blue-500/10 text-indigo-600 border-indigo-500/20",
  };
  return map[type] || "bg-secondary text-muted-foreground border-border";
}
