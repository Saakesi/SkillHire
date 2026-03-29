import { Link } from "react-router-dom";
import { Search, Bookmark, Settings, Github, LogOut } from "lucide-react";

const TABS = [
  { id: "search", icon: <Search className="w-3.5 h-3.5" />, label: "Search" },
  { id: "shortlists", icon: <Bookmark className="w-3.5 h-3.5" />, label: "Shortlists" },
  { id: "settings", icon: <Settings className="w-3.5 h-3.5" />, label: "Settings" },
];

export default function DashboardNav({ tab, setTab, recruiter, shortlistCount, onLogout }) {
  return (
    <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
        {/* Left: logo + tabs */}
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
              <Github className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-bold text-sm">SkillHire</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 font-medium">
              Recruiter
            </span>
          </Link>

          <nav className="hidden sm:flex items-center gap-1">
            {TABS.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors ${tab === t.id
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                  }`}>
                {t.icon} {t.label}
                {t.id === "shortlists" && shortlistCount > 0 && (
                  <span className="w-4 h-4 rounded-full bg-primary text-primary-foreground text-[9px] font-bold flex items-center justify-center">
                    {shortlistCount}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Right: user info + sign out */}
        <div className="flex items-center gap-3">
          {recruiter && (
            <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
              <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                {recruiter.name?.[0]?.toUpperCase()}
              </div>
              <span className="font-medium text-foreground">{recruiter.name}</span>
              {recruiter.company && <span className="text-xs">· {recruiter.company}</span>}
            </div>
          )}
          <button onClick={onLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
            <LogOut className="w-3.5 h-3.5" /> Sign out
          </button>
        </div>
      </div>
    </header>
  );
}
