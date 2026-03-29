import { motion, AnimatePresence } from "framer-motion";
import { X, Code2, BarChart3, GraduationCap, Zap, Building2, BookOpen } from "lucide-react";
import { DEV_TYPES, POPULAR_SKILLS, BRANCHES } from "./constants";
import CollegeSelect from "../ui/CollegeSelect";

export default function FilterPanel({
  open,
  onClose,
  onApply,
  onReset,
  // filter values + setters
  developerType, setDeveloperType,
  minScore, setMinScore,
  maxScore, setMaxScore,
  batch, setBatch,
  college, setCollege,
  branch, setBranch,
  selectedSkills,
  skillInput, setSkillInput,
  onToggleSkill,
  onAddSkillFromInput,
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.2 }}
          
        >
          <div className="rounded-xl border border-border bg-card p-5 space-y-5  overflow-visible">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-sm">Filters</h3>
              <button onClick={onClose}><X className="w-4 h-4 text-muted-foreground" /></button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Developer Type */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                  <Code2 className="w-3.5 h-3.5" /> Developer Type
                </label>
                <div className="flex flex-wrap gap-2">
                  {DEV_TYPES.map(t => (
                    <button key={t} onClick={() => setDeveloperType(t)}
                      className={`px-2.5 py-1 rounded-full text-xs border transition-colors ${developerType === t
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-secondary border-border hover:border-primary/40"
                        }`}>
                      {t || "All"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Score Range */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                  <BarChart3 className="w-3.5 h-3.5" /> Score Range
                </label>
                <div className="flex items-center gap-2">
                  <input type="number" min={0} max={100} value={minScore}
                    onChange={e => setMinScore(e.target.value)}
                    className="w-16 px-2 py-1.5 text-sm text-center rounded-lg border border-border bg-background focus:outline-none focus:ring-1 focus:ring-primary" />
                  <span className="text-muted-foreground text-sm">–</span>
                  <input type="number" min={0} max={100} value={maxScore}
                    onChange={e => setMaxScore(e.target.value)}
                    className="w-16 px-2 py-1.5 text-sm text-center rounded-lg border border-border bg-background focus:outline-none focus:ring-1 focus:ring-primary" />
                </div>
              </div>

              {/* Graduation Year */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                  <GraduationCap className="w-3.5 h-3.5" /> Graduation Year
                </label>
                <select value={batch} onChange={e => setBatch(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-1 focus:ring-primary">
                  <option value="">All years</option>
                  {Array.from({ length: 11 }, (_, i) => 2020 + i).reverse().map(y => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Skills */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5" /> Skills
              </label>
              <input
                value={skillInput}
                onChange={e => setSkillInput(e.target.value)}
                onKeyDown={onAddSkillFromInput}
                placeholder="Type a skill and press Enter (e.g. C++, Rust)"
                className="w-full px-3 py-1.5 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <div className="flex flex-wrap gap-2">
                {POPULAR_SKILLS.map(skill => (
                  <button key={skill} onClick={() => onToggleSkill(skill)}
                    className={`px-2.5 py-1 rounded-full text-xs border transition-colors ${selectedSkills.includes(skill)
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-secondary border-border hover:border-primary/40"
                      }`}>
                    {skill}
                  </button>
                ))}
              </div>
              {selectedSkills.filter(s => !POPULAR_SKILLS.includes(s)).length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {selectedSkills.filter(s => !POPULAR_SKILLS.includes(s)).map(skill => (
                    <span key={skill} className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-primary/10 text-primary border border-primary/20">
                      {skill}
                      <button onClick={() => onToggleSkill(skill)} className="hover:text-primary/60">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
              {selectedSkills.length > 0 && (
                <button onClick={() => selectedSkills.forEach(s => onToggleSkill(s))}
                  className="text-xs text-muted-foreground hover:text-foreground">
                  Clear all skills
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* College */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5" /> College
                </label>
                <CollegeSelect  
                  value={college}
                  onChange={(selectedCollege) => {
                    setCollege(selectedCollege?.name || "");
                  }}
                />
              </div>
              {/* Branch */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5" /> Branch
                </label>
                <select value={branch} onChange={e => setBranch(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-1 focus:ring-primary">
                  <option value="">All branches</option>
                  {BRANCHES.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-border">
              <button onClick={onReset} className="text-sm text-muted-foreground hover:text-foreground">
                Reset all
              </button>
              <button onClick={onApply}
                className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
                Apply
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
