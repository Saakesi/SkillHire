export default function StatCard({ icon, label, value, sub }) {
  return (
    <div className="p-5 rounded-xl border border-border bg-card">
      <div className="flex items-center gap-2 text-muted-foreground mb-2 text-sm">
        {icon} {label}
      </div>
      <p className="text-3xl font-bold font-mono">{value ?? "—"}</p>
      {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
    </div>
  );
}
