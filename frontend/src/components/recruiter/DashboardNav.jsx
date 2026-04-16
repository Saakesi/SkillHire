import { Link } from "react-router-dom";
import { Search, Bookmark, Settings, Github, LogOut, UserCheck, Share2, MessageSquare } from "lucide-react";
import { Avatar } from "../ui/Avatar";

const TABS = [
  { id: "search", icon: <Search className="w-3.5 h-3.5" />, label: "Search" },
  { id: "connections", icon: <UserCheck className="w-3.5 h-3.5" />, label: "Connections" },
  { id: "referrals", icon: <Share2 className="w-3.5 h-3.5" />, label: "Referrals" },
  { id: "messages", icon: <MessageSquare className="w-3.5 h-3.5" />, label: "Messages" },
  { id: "shortlists", icon: <Bookmark className="w-3.5 h-3.5" />, label: "Shortlists" },
  { id: "settings", icon: <Settings className="w-3.5 h-3.5" />, label: "Settings" },
];

export default function DashboardNav({ tab, setTab, recruiter, shortlistCount, onLogout }) {
  const recruiterName = recruiter?.name || recruiter?.username || "Recruiter";
  const recruiterCompany = recruiter?.company || "";

  return (
    <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-2">
        <div className="flex items-center justify-between gap-3">
          <Link to="/" className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center shrink-0">
              <Github className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-bold text-sm">SkillHire</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 font-medium">
              Recruiter
            </span>
          </Link>

          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            {recruiter && (
              <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground min-w-0">
                <Avatar src={recruiter?.avatarUrl} name={recruiterName} size="sm" />
                <span className="font-medium text-foreground truncate max-w-[150px]">{recruiterName}</span>
                {recruiterCompany && (
                  <span className="text-xs truncate max-w-[140px]">- {recruiterCompany}</span>
                )}
              </div>
            )}
            <button
              onClick={onLogout}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sign out</span>
            </button>
          </div>
        </div>

        <nav className="mt-3 flex items-center gap-1 overflow-x-auto no-scrollbar pb-1">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                tab === t.id
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              }`}
            >
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
    </header>
  );
}
