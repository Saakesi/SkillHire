import { motion } from "framer-motion";

export default function ProgressBar({ value, color = "#6366f1" }) {
  return (
    <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${value}%` }}
        style={{backgroundColor:color}}
        transition={{ duration: 0.6 }}
        className="h-full rounded-full"
      />
    </div>
  );
}