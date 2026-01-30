import { motion } from 'framer-motion';

export const StatCard = ({ icon, label, value, trend, trendUp, className = '' }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-card border border-border rounded-2xl p-6 ${className}`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="p-3 rounded-xl bg-primary/10 text-primary">{icon}</div>
        {trend && (
          <span
            className={`text-sm font-medium ${
              trendUp ? 'text-green-500' : 'text-red-500'
            }`}
          >
            {trendUp ? '↑' : '↓'} {trend}
          </span>
        )}
      </div>
      <div className="text-3xl font-bold text-foreground mb-1">{value}</div>
      <div className="text-sm text-muted-foreground">{label}</div>
    </motion.div>
  );
};

export const MiniStat = ({ label, value, icon }) => (
  <div className="flex items-center gap-3">
    {icon && <div className="text-muted-foreground">{icon}</div>}
    <div>
      <div className="text-lg font-bold text-foreground">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  </div>
);
