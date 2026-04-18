import { motion } from "framer-motion";
import { Zap } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "../../../components/ui/Card";
import {
  TECH_ICONS,
  SKILL_ICON_KEY,
  getLeetcodeOnlyLanguages,
  getUniqueSkillKeys
} from "../utils/dashboardUtils";

export function SkillsSection({ metrics, lc }) {
  const uniqueSkills = getUniqueSkillKeys(metrics?.skills || []);
  const leetcodeOnlyLanguages = getLeetcodeOnlyLanguages(metrics, lc);

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4 }}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-primary" /> Skills
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {uniqueSkills.map((skill) => {
              const key = SKILL_ICON_KEY(skill);
              return (
                <div
                  key={key}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-border text-xs hover:border-primary/40 transition-colors"
                >
                  {TECH_ICONS[key] && <img src={TECH_ICONS[key]} className="w-3.5 h-3.5" alt={skill} />}
                  <span>{skill}</span>
                </div>
              );
            })}

            {leetcodeOnlyLanguages.map((l) => {
              const key = SKILL_ICON_KEY(l.languageName);
              return (
                <div
                  key={`lc-${l.languageName}`}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-border text-xs hover:border-primary/40 transition-colors"
                >
                  {TECH_ICONS[key] && <img src={TECH_ICONS[key]} className="w-3.5 h-3.5" alt={l.languageName} />}
                  <span>{l.languageName}</span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
